(function() {
    $(document).ready(function() {
        /**
         * How many seconds before game starts.
         * @type {number}
         */
        var COUNTDOWN_TIME = 10;

        /**
         * Countdown start time.
         * @type {number}
         */
        var countDownStartTime = 0;

        /**
         * Current countdown to the seconds.
         * @type {number}
         */
        var currentCountDownSeconds = 0;

        /**
         * List of peers.
         * @type {DataConnection[]}
         */
        var peers = [];

        /**
         * Updates peer list on the page.
         */
        function updatePeersList() {
            $('#num-players').text(peers.length);
            $('#players-list tbody').html(
                peers.length ? '' :
                    '<tr><td colspan="3">No players yet.</td></tr>'
            );
            if (peers.length > 0) {
                peers.forEach(function(peerConn, index) {
                    var row = $('<tr>' +
                        '<td>' + (index + 1) + '</td>' +
                        '<td>' + peerConn.peer + '</td>' +
                        '<td>' + peerConn._peerBrowser + '</td>' +
                        '</tr>');
                    $('#players-list tbody').append(row);
                });
            }
        }

        /**
         * Resets the states.
         */
        function reset() {
            currentCountDownSeconds = -1;
            peers = [];
            updatePeersList();
        }

        /**
         * Updates game countdown counter.
         */
        function updateCountDown() {
            if (peers.length >= 2) {
                var now = new Date().getTime();
                var secs = COUNTDOWN_TIME - Math.floor((now - countDownStartTime) * 0.001);
                $('#countdown').text(secs);
                if (currentCountDownSeconds !== secs) {
                    currentCountDownSeconds = secs;

                    // start game when countdown reaches 0, and remove the peer
                    if (secs <= 0) {
                        var peersClone = peers.concat();
                        reset();
                        peersClone.forEach(function(peer) {
                            peer.send('start');
                            peer.close();
                        });
                    }
                }
            } else {
                $('#countdown').text('... waiting for at least 2 players');
            }
            requestAnimationFrame(updateCountDown);
        }

        /**
         * Adds a peer into the list.
         * @param {DataConnection} conn
         */
        function addPeer(conn) {
            peers.push(conn);
            if (peers.length <= 2) {
                countDownStartTime = new Date().getTime();
            }
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
         * Peer object for this admin.
         * @type {Peer}
         */
        var peer = new Peer('jumpyadmin', {
            //key: 'apv9cn0q4669wwmi',
            port: 9999,
            host: 'localhost'
        });

        peer.on('open', function(id) {
            console.log('[OPEN] Peer ID: ' + id);
            reset();
            updateCountDown();
        });
        peer.on('connection', function(conn) {
            console.log('[CONNECTION] Connection...', conn);
            conn.on('open', function() {
                console.log('[CONNECTION OPEN]');
                addPeer(conn);
                updatePeersList();
            });
            conn.on('data', function(data) {
                console.log('[CONNECTION DATA]', data);
            });
            conn.on('close', function() {
                console.log('[CONNECTION CLOSE]');
                removePeer(conn);
                updatePeersList();
            });
            conn.on('error', function(error) {
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
    });
})();