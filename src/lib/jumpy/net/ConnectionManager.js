/**
 * Connection manager provides convenient methods and dispatches events for P2P communication.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig"
], function(createjs, GameConfig) {
    // ===========================================
    //  Singleton
    // ===========================================
    var instance = null;

    // ===========================================
    //  Event Types
    // ===========================================
    /**
     * Dispatched when connection to admin is successfully established.
     * @type {string}
     */
    ConnectionManager.CONNECTION_SUCCESS = "connectionSuccess";

    /**
     * Dispatched when there is an error connecting to admin.
     * @type {string}
     */
    ConnectionManager.CONNECTION_ERROR = "connectionError";

    /**
     * Dispatched when admin says game start.
     * @type {string}
     */
    ConnectionManager.GAME_START = "gameStart";

    /**
     * Dispatched when admin sends game start time.
     * @type {string}
     */
    ConnectionManager.GAME_START_TIME_RECEIVED = "gameStartTimeReceived";

    /**
     * Dispatched when admin sends wait.
     * @type {string}
     */
    ConnectionManager.WAIT_FOR_OTHERS = "waitForOthers";

    /**
     * Dispatched when peer is added.
     * @type {string}
     */
    ConnectionManager.PEER_ADD = "peerAdd";

    /**
     * Dispatched when peer is removed.
     * @type {string}
     */
    ConnectionManager.PEER_REMOVE = "peerRemove";

    /**
     * Dispatched when peer jumps to a platform.
     * @type {string}
     */
    ConnectionManager.PEER_PLATFORM = "peerPlatform";

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * The time when the next game session will start in milliseconds. This is used only for showing countdown
     * and not to determine when the game actually starts. The admin will mandate the actual start action.
     * @type {number}
     */
    ConnectionManager.prototype.gameStartTime = null;

    /**
     * The time shared across all client.
     * @type {number}
     */
    ConnectionManager.prototype.globalTime = null;

    /**
     * The difference between global time and client time.
     * @type {number}
     */
    ConnectionManager.prototype.timeDiff = null;

    /**
     * Currently selected animal Id.
     * @type {string}
     */
    ConnectionManager.prototype.animalId = null;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Admin peer.
     * @type {Peer}
     */
    ConnectionManager.prototype._admin = null;

    /**
     * @private
     * Peer client.
     * @type {Peer}
     */
    ConnectionManager.prototype._peer = null;

    /**
     * @private
     * Other peer clients.
     * @type {Peer[]}
     */
    ConnectionManager.prototype._peers = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function ConnectionManager() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one ConnectionManager, use ConnectionManager.getInstance()");
        }

        this._peers = [];
    }

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(ConnectionManager.prototype);

    /**
     * Gets singleton instance.
     * @return ConnectionManager singleton.
     */
    ConnectionManager.getInstance = function() {
        if (instance === null) {
            instance = new ConnectionManager();
        }
        return instance;
    };

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Connects to the admin peer.
     */
    ConnectionManager.prototype.connect = function() {
        this._peer = new Peer({
            //key: 'apv9cn0q4669wwmi'
            port: 9999,
            host: 'localhost'
        });

        this._peer.on('open', function(id) {
            console.log('[OPEN] Peer ID: ' + id);
            var adminConn = this._peer.connect('jumpyadmin');
            this._admin = adminConn;
            adminConn.on('open', function() {
                console.log('[CONNECTION OPEN]');
                this.dispatchEvent(new createjs.Event(ConnectionManager.CONNECTION_SUCCESS));
            }.bind(this));
            adminConn.on('data', function(data) {
                console.log('[CONNECTION DATA]', data);
                // disconnect from admin, connect to peers and start game
                switch (data.action) {
                    case 'start':
                        this._startGame(data.peerIds);
                        break;

                    case 'startTime':
                        this.gameStartTime = data.startTime;
                        this.globalTime = data.globalTime;
                        this.timeDiff = new Date().getTime() - this.globalTime;
                        this.dispatchEvent(new createjs.Event(ConnectionManager.GAME_START_TIME_RECEIVED));
                        break;

                    case 'wait':
                        this.dispatchEvent(new createjs.Event(ConnectionManager.WAIT_FOR_OTHERS));
                        break;
                }
            }.bind(this));
            adminConn.on('close', function() {
                console.log('[CONNECTION CLOSE]');
                this.dispatchEvent(new createjs.Event(ConnectionManager.CONNECTION_ERROR));
            }.bind(this));
            adminConn.on('error', function(error) {
                console.error('[CONNECTION ERROR]', error);
                this.dispatchEvent(new createjs.Event(ConnectionManager.CONNECTION_ERROR));
            }.bind(this));
        }.bind(this));
        this._peer.on('connection', function(conn) {
            this._addPeer(conn);
        }.bind(this));
        this._peer.on('close', function() {
            console.log('[CLOSE]');
        }.bind(this));
        this._peer.on('disconnected', function() {
            console.log('[DISCONNECTED]');
        }.bind(this));
        this._peer.on('error', function(error) {
            console.error('[ERROR]', error);
            this.dispatchEvent(new createjs.Event(ConnectionManager.CONNECTION_ERROR));
        }.bind(this));
    };

    /**
     * States to the server the intention to join the currently open game session.
     */
    ConnectionManager.prototype.join = function() {
        this._admin.send({
            action: 'join'
        });
    };

    /**
     * Tells everyone else the current platform index.
     *
     * @param {number} platformIndex
     */
    ConnectionManager.prototype.updatePlatformIndex = function(platformIndex) {
        this._peers.forEach(function(peerConn) {
            peerConn.send({
                action: 'platform',
                platformIndex: platformIndex
            });
        });
    };

    /**
     * Tells the admin the current score.
     *
     * @param {number} score
     */
    ConnectionManager.prototype.updateScore = function(score) {
        this._admin.send({
            action: 'score',
            score: score
        });
    };

    // ===========================================
    //  Protected Methods
    // ===========================================
    /**
     * @private
     * Adds a peer into the list.
     *
     * @param {DataConnection} conn Peer connection to add.
     */
    ConnectionManager.prototype._addPeer = function(conn) {
        if (this._peers.filter(function(peerConn) { return peerConn.peer === conn.peer; }).length === 0) {
            this._peers.push(conn);

            console.log(conn);
            conn.on('open', function() {
                console.log('[PEER CONNECTION OPEN]', conn);
                conn.send({
                    action: 'animal',
                    animalId: this.animalId
                });
            }.bind(this));
            conn.on('data', function(data) {
                console.log(data);
                switch (data.action) {
                    case 'animal':
                        this.dispatchEvent(new createjs.Event(ConnectionManager.PEER_ADD, {
                            peerId: conn.peer,
                            animalId: data.animalId
                        }));
                        break;

                    case 'platform':
                        this.dispatchEvent(new createjs.Event(ConnectionManager.PEER_PLATFORM, {
                            peerId: conn.peer,
                            platformIndex: data.platformIndex
                        }));
                        break;
                }
            }.bind(this));
            conn.on('close', function() {
                console.log('[PEER CONNECTION CLOSE]', conn);
                this._removePeer(conn);
            }.bind(this));
            conn.on('error', function(error) {
                console.error('[PEER CONNECTION ERROR]', conn, error);
                this._removePeer(conn);
            }.bind(this));
        }
    };

    /**
     * @private
     * Removes a peer from the list.
     *
     * @param {DataConnection} conn Peer connection to remove.
     */
    ConnectionManager.prototype._removePeer = function(conn) {
        var i = this._peers.length;
        while (--i >= 0) {
            if (this._peers[i].peer === conn.peer) {
                this.dispatchEvent(new createjs.Event(ConnectionManager.PEER_REMOVE, conn.peer));
                this._peers.splice(i, 1)[0].destroy();
                break;
            }
        }
    };

    /**
     * @private
     * Removes all peers from the list.
     */
    ConnectionManager.prototype._removeAllPeers = function() {
        var i = this._peers.length;
        var conn;
        while (--i >= 0) {
            conn = this.pop();
            this.dispatchEvent(new createjs.Event(ConnectionManager.PEER_REMOVE, conn.peer));
            conn.destroy();
        }
    };

    /**
     * Starts the game.
     *
     * @param {string[]} peerIds Peer IDs connected.
     */
    ConnectionManager.prototype._startGame = function(peerIds) {
        if (!peerIds || !peerIds.length) {
            console.error('Oops! Error connecting to peers');
            this.dispatchEvent(new createjs.Event(ConnectionManager.CONNECTION_ERROR));
        } else {
            peerIds.forEach(function(peerId) {
                if (peerId !== this._peer.peer) {
                    this._addPeer(this._peer.connect(peerId));
                }
            }.bind(this));
            this.dispatchEvent(new createjs.Event(ConnectionManager.GAME_START));
        }
    };

    return ConnectionManager;
});