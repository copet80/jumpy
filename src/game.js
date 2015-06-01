(function() {

    /**
     * List of peers.
     * @type {DataConnection[]}
     */
    var peers = [];

    /**
     * Adds a peer into the list.
     * @param {DataConnection} conn
     */
    function addPeer(conn) {
        peers.push(conn);
    }

    /**
     * Removes a peer from the list.
     * @param {DataConnection} conn
     */
    function removePeer(conn) {
        var i = peers.length;
        while (--i >= 0) {
            if (peers[i].peer === conn.peer) {
                peers.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Starts game.
     * @param {string[]} peerIds
     */
    function startGame(peerIds) {
        if (!peerIds || !peerIds.length) {
            // TODO: show error on the game client
            console.error('Oops! Error connecting to peers');
        } else {
            peerIds.forEach(function(peerId) {
                var conn = peer.connect(peerId);
                conn.on('open', function () {
                    console.log('[PEER CONNECTION OPEN]', conn);
                    addPeer(conn);
                });
                conn.on('data', function(data) {
                    console.log(data);
                });
                conn.on('close', function() {
                    console.log('[PEER CONNECTION CLOSE]', conn);
                    removePeer(conn);
                });
                conn.on('error', function(error) {
                    console.error('[PEER CONNECTION ERROR]', conn, error);
                });
            });
        }
    }

    /**
     * Peer object for this game client.
     * @type {Peer}
     */
    var peer = new Peer({
        //key: 'apv9cn0q4669wwmi'
        port: 9999,
        host: 'localhost'
    });

    peer.on('open', function(id) {
        console.log('[OPEN] Peer ID: ' + id);

        var adminConn = peer.connect('jumpyadmin');
        adminConn.on('open', function() {
            console.log('[CONNECTION OPEN]');
        });
        adminConn.on('data', function(data) {
            console.log('[CONNECTION DATA]', data);
            // disconnect from admin, connect to peers and start game
            if (data.action === 'start') {
                startGame(data.peerIds);
            }
        });
        adminConn.on('close', function() {
            console.log('[CONNECTION CLOSE]');
        });
        adminConn.on('error', function(error) {
            console.error('[CONNECTION ERROR]', error);
        });
    });
    peer.on('close', function() {
        console.log('[CLOSE]');
    });
    peer.on('disconnected', function() {
        console.log('[DISCONNECTED]');
    });
    peer.on('error', function(error) {
        console.error('[ERROR]', error);
    });
})();