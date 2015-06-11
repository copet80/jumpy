/**
 * Connection manager provides convenient methods and dispatches events for P2P communication.
 *
 * @author Anthony Tambrin
 */
define([
    "jumpy/core/GameConfig"
], function(createjs, GameConfig) {
    // ===========================================
    //  Singleton
    // ===========================================
    var instance = null;

    // ===========================================
    //  Protected Members
    // ===========================================
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
        this._connect();
    }

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
    //  Protected Methods
    // ===========================================
    /**
     * @private
     * Connects to the admin peer.
     */
    ConnectionManager.prototype._connect = function() {
        this._peer = new Peer({
            //key: 'apv9cn0q4669wwmi'
            port: 9999,
            host: 'localhost'
        });

        this._peer.on('open', function(id) {
            console.log('[OPEN] Peer ID: ' + id);

            var adminConn = this._peer.connect('jumpyadmin');
            adminConn.on('open', function() {
                console.log('[CONNECTION OPEN]');
            }.bind(this));
            adminConn.on('data', function(data) {
                console.log('[CONNECTION DATA]', data);
                // disconnect from admin, connect to peers and start game
                if (data.action === 'start') {
                    this._startGame(data.peerIds);
                }
            }.bind(this));
            adminConn.on('close', function() {
                console.log('[CONNECTION CLOSE]');
            }.bind(this));
            adminConn.on('error', function(error) {
                console.error('[CONNECTION ERROR]', error);
            }.bind(this));
        }.bind(this));
        this._peer.on('close', function() {
            console.log('[CLOSE]');
        }.bind(this));
        this._peer.on('disconnected', function() {
            console.log('[DISCONNECTED]');
        }.bind(this));
        this._peer.on('error', function(error) {
            console.error('[ERROR]', error);
        }.bind(this));
    };

    /**
     * @private
     * Adds a peer into the list.
     *
     * @param {DataConnection} conn Peer connection to add.
     */
    ConnectionManager.prototype._addPeer = function(conn) {
        this._peers.push(conn);
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
                this._peers.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Starts the game.
     *
     * @param {string[]} peerIds Peer IDs connected.
     */
    ConnectionManager.prototype._startGame = function(peerIds) {
        if (!peerIds || !peerIds.length) {
            // TODO: show error on the game client
            console.error('Oops! Error connecting to peers');
        } else {
            peerIds.forEach(function(peerId) {
                var conn = this._peer.connect(peerId);
                conn.on('open', function () {
                    console.log('[PEER CONNECTION OPEN]', conn);
                    this._addPeer(conn);
                }.bind(this));
                conn.on('data', function(data) {
                    console.log(data);
                }.bind(this));
                conn.on('close', function() {
                    console.log('[PEER CONNECTION CLOSE]', conn);
                    this._removePeer(conn);
                }.bind(this));
                conn.on('error', function(error) {
                    console.error('[PEER CONNECTION ERROR]', conn, error);
                }.bind(this));
            }.bind(this));
        }
    };

    return ConnectionManager;
});