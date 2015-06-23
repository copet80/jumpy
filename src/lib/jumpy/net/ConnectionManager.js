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
    //  Private Constants
    // ===========================================
    /**
     * @private
     * Debug mode.
     * @type {boolean}
     */
    const DEBUG = false;

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
     * Dispatched when admin says game end.
     * @type {string}
     */
    ConnectionManager.GAME_END = "gameEnd";

    /**
     * Dispatched when admin sends game end time.
     * @type {string}
     */
    ConnectionManager.GAME_END_TIME_RECEIVED = "gameEndTimeReceived";

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
     * Currently selected animal Id.
     * @type {string}
     */
    ConnectionManager.prototype.animalId = null;

    /**
     * Mapping between peer ID and animal IDs.
     * @type {string{}}
     */
    ConnectionManager.prototype.animalIdsMapping = {};

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

    /**
     * @private
     * IDs of other peer client who will try to connect to this client.
     * @type {Peer[]}
     */
    ConnectionManager.prototype._incomingPeerIds = null;

    /**
     * @private
     * IDs of other peer client who this client will try to connect to.
     * @type {Peer[]}
     */
    ConnectionManager.prototype._outgoingPeerIds = null;

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
    //  Getters / Setters
    // ===========================================
    /**
     * Current player's peer ID.
     * @type {string}
     */
    ConnectionManager.prototype.__defineGetter__("myPeerId", function() {
        return this._peer ? this._peer.id : null;
    });

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
            //host: 'anthonytdt.objective.com'
        });

        this._peer.on('open', function(id) {
            this._log('[OPEN] Peer ID: ' + id);
            var adminConn = this._peer.connect('jumpyadmin');
            this._admin = adminConn;
            adminConn.on('open', function() {
                this._log('[CONNECTION OPEN]');
                this.dispatchEvent(new createjs.Event(ConnectionManager.CONNECTION_SUCCESS));
            }.bind(this));
            adminConn.on('data', function(data) {
                this._log('[CONNECTION DATA]', data);
                var event;
                switch (data.action) {
                    case 'wait':
                        this.dispatchEvent(new createjs.Event(ConnectionManager.WAIT_FOR_OTHERS));
                        break;

                    case 'startTime':
                        event = new createjs.Event(ConnectionManager.GAME_START_TIME_RECEIVED);
                        event.gameStartTime = data.startTime;
                        event.timeDiff = new Date().getTime() - data.globalTime;
                        this.dispatchEvent(event);
                        break;

                    case 'start':
                        this._startGame(data.peerIds);
                        event = new createjs.Event(ConnectionManager.GAME_END_TIME_RECEIVED);
                        event.gameEndTime = data.endTime;
                        this.dispatchEvent(event);
                        break;

                    case 'end':
                        this._endGame(data);
                        break;
                }
            }.bind(this));
            adminConn.on('close', function() {
                this._log('[CONNECTION CLOSE]');
                this.dispatchEvent(new createjs.Event(ConnectionManager.CONNECTION_ERROR));
            }.bind(this));
            adminConn.on('error', function(error) {
                console.error('[CONNECTION ERROR]', error);
                this.dispatchEvent(new createjs.Event(ConnectionManager.CONNECTION_ERROR));
            }.bind(this));
        }.bind(this));
        this._peer.on('connection', function(conn) {
            this._log('[PEER CONNECTION]', conn);
            // only add peer from incoming client
            if (this._incomingPeerIds.indexOf(conn.peer) >= 0) {
                this._addPeer(conn);
            }
        }.bind(this));
        this._peer.on('close', function() {
            this._log('[CLOSE]');
        }.bind(this));
        this._peer.on('disconnected', function() {
            this._log('[DISCONNECTED]');
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
     * Resets the connection state.
     */
    ConnectionManager.prototype._reset = function() {
        if (this._peer) {
            this._peer.destroy();
        }
        this._admin = null;
        this._peer = null;
        this._peers = [];
        this._incomingPeerIds = [];
        this._outgoingPeerIds = [];
    };

    /**
     * @private
     * Adds a peer into the list.
     *
     * @param {DataConnection} conn Peer connection to add.
     */
    ConnectionManager.prototype._addPeer = function(conn) {
        var event;

        if (this._peers.filter(function(peerConn) { return peerConn.peer === conn.peer; }).length === 0) {
            this._peers.push(conn);
        }

        conn.on('open', function() {
            this._log('[PEER CONNECTION OPEN]', conn);
            conn.on('data', function(data) {
                this._log('[PEER CONNECTION DATA]', data);
                switch (data.action) {
                    case 'animal':
                        event = new createjs.Event(ConnectionManager.PEER_ADD);
                        event.peerId = conn.peer;
                        event.animalId = data.animalId;
                        this.animalIdsMapping[event.peerId] = event.animalId;
                        this.dispatchEvent(event);
                        break;

                    case 'platform':
                        event = new createjs.Event(ConnectionManager.PEER_PLATFORM);
                        event.peerId = conn.peer;
                        event.platformIndex = data.platformIndex;
                        this.dispatchEvent(event);
                        break;
                }
            }.bind(this));
            conn.on('close', function() {
                this._log('[PEER CONNECTION CLOSE]', conn);
                this._removePeer(conn);
            }.bind(this));
            conn.on('error', function(error) {
                console.error('[PEER CONNECTION ERROR]', conn, error);
                this._removePeer(conn);
            }.bind(this));
            conn.send({
                action: 'animal',
                animalId: this.animalId
            });
        }.bind(this));
    };

    /**
     * @private
     * Removes a peer from the list.
     *
     * @param {DataConnection} conn Peer connection to remove.
     */
    ConnectionManager.prototype._removePeer = function(conn) {
        var event;
        var i = this._peers.length;
        while (--i >= 0) {
            if (this._peers[i].peer === conn.peer) {
                event = new createjs.Event(ConnectionManager.PEER_REMOVE);
                event.peerId = conn.peer;
                this.dispatchEvent(event);
                this._peers.splice(i, 1);
                break;
            }
        }
    };

    /**
     * @private
     * Removes all peers from the list.
     */
    ConnectionManager.prototype._removeAllPeers = function() {
        var event;
        var i = this._peers.length;
        var conn;
        while (--i >= 0) {
            conn = this.pop();
            event = new createjs.Event(ConnectionManager.PEER_REMOVE);
            event.peerId = conn.peer;
            this.dispatchEvent(event);
        }
    };

    /**
     * Starts the game.
     *
     * @param {string[]} peerIds Peer IDs connected.
     */
    ConnectionManager.prototype._startGame = function(peerIds) {
        this.animalIdsMapping = {};
        // self-organise incoming and outgoing peer connections so that peers don't go into a connection race
        this._outgoingPeerIds = [];
        this._incomingPeerIds = [];
        var myPeerIndex = peerIds.indexOf(this._peer.id);
        peerIds.forEach(function(peerId, index) {
            if (index < myPeerIndex) {
                this._incomingPeerIds.push(peerId);
            } else if (index > myPeerIndex) {
                this._outgoingPeerIds.push(peerId);
            }
        }.bind(this));

        if (!peerIds || !peerIds.length) {
            console.error('Oops! Error connecting to peers');
            this.dispatchEvent(new createjs.Event(ConnectionManager.CONNECTION_ERROR));
        } else {
            peerIds.forEach(function(peerId) {
                if (this._outgoingPeerIds.indexOf(peerId) >= 0) {
                    this._addPeer(this._peer.connect(peerId));
                }
            }.bind(this));
            this.dispatchEvent(new createjs.Event(ConnectionManager.GAME_START));
        }

        this._admin.send({
            action: 'animal',
            animalId: this.animalId
        });
    };

    /**
     * Ends the game.
     *
     * @param {object} data
     */
    ConnectionManager.prototype._endGame = function(data) {
        this._reset();
        var event = new createjs.Event(ConnectionManager.GAME_END);
        event.animalIdsMapping = this.animalIdsMapping;
        event.ranks = data.ranks;
        this.dispatchEvent(event);
    };

    /**
     * @private
     * Console log.
     * @param {string} text
     */
    ConnectionManager.prototype._log = function(text) {
        if (DEBUG) {
            console.log(text);
        }
    };

    return ConnectionManager;
});