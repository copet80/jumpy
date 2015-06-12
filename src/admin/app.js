(function() {
    $(document).ready(function() {
        /**
         * Peer has connected but hasn't made a decision to join a game.
         * @type {string}
         */
        var STATUS_IDLE = 'idle';

        /**
         * Peer has stated intention to join a game.
         * @type {string}
         */
        var STATUS_JOINING = 'joining';

        /**
         * Peer is playing a game.
         * @type {string}
         */
        var STATUS_PLAYING = 'playing';

        /**
         * How many seconds before game starts.
         * @type {number}
         */
        var COUNTDOWN_TIME = 10;

        /**
         * Countdown start time.
         * @type {number}
         */
        var countdownStartTime = 0;

        /**
         * Current countdown to the seconds.
         * @type {number}
         */
        var currentCountDownSeconds = 0;

        /**
         * List of peers.
         * @type {DataConnection[]}
         */
        var peersInQueue = [];

        /**
         * List of peers by game ID.
         * @type {object}
         */
        var peersByGameId = {};

        /**
         * List of peer tables by game ID.
         * @type {object}
         */
        var tablesByGameId = {};

        /**
         * Updates peer list on the page.
         */
        function updatePeersList() {
            $('#num-players').text(peersInQueue.length);
            $('#players-list .queue tbody').html(
                peersInQueue.length ? '' : '<tr><td colspan="4">No players yet.</td></tr>'
            );
            if (peersInQueue.length > 0) {
                peersInQueue.forEach(function(peerConn, index) {
                    var row = $('<tr>' +
                        '<td>' + (index + 1) + '</td>' +
                        '<td>' + peerConn.peer + '</td>' +
                        '<td>' + peerConn._peerBrowser + '</td>' +
                        '<td>' + peerConn.status + '</td>' +
                        '<td>' + peerConn.score + '</td>' +
                        '</tr>');
                    $('#players-list tbody').append(row);
                });
            }
            if (peersByGameId) {
                Object.keys(peersByGameId).forEach(function(gameId) {
                    var peers = peersByGameId[gameId];
                    var table = tablesByGameId[gameId];
                    if (!table) {
                        table = $('<table class="table table-condensed table-bordered game">' +
                            '<thead>' +
                            '<tr>' +
                            '<th colspan="4">' +
                            'Game #<span class="game-id">' + gameId + '</span>' +
                            '<br>' +
                            'Remaining Time: <span class="time"></span>' +
                            '</th>' +
                            '</tr>' +
                            '<tr>' +
                            '<th>#</th>' +
                            '<th>Player ID</th>' +
                            '<th>Browser</th>' +
                            '<th>Score</th>' +
                            '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                            '</tbody>' +
                            '</table>');
                        tablesByGameId[gameId] = table;
                    }
                    table.find('tbody').html(
                        peers.length ? '' : '<tr><td colspan="4">No players yet.</td></tr>'
                    );
                    peers.forEach(function(peer) {
                    });
                });
            }
        }

        /**
         * Resets the states.
         */
        function reset() {
            currentCountDownSeconds = -1;
            countdownStartTime = -1;
            peersInQueue = [];
            peersByGameId = {};
            updatePeersList();
        }

        /**
         * Resets countdown.
         */
        function resetCountdown() {
            if (countdownStartTime < 0 && getPeersByStatus(STATUS_JOINING).length <= 2) {
                countdownStartTime = new Date().getTime();
            }
        }

        /**
         * Gets peers by status, i.e. joining, idle, etc..
         */
        function getPeersByStatus(status) {
            return peersInQueue.filter(function(peer) {
                return peer.status === status;
            });
        }

        /**
         * Removes peers from the queue by their IDs.
         * @param {string[]} peerIds ID of the peers to remove.
         */
        function removePeersFromQueueById(peerIds) {
            var i = peersInQueue.length;
            while (--i >= 0) {
                if (peerIds.indexOf(peersInQueue[i].peer) !== -1) {
                    peersInQueue.splice(i, 1);
                }
            }
        }

        /**
         * Updates game countdown counter.
         */
        function updateCountDown() {
            if (getPeersByStatus(STATUS_JOINING).length >= 2) {
                var now = new Date().getTime();
                var secs = COUNTDOWN_TIME - Math.floor((now - countdownStartTime) * 0.001);
                $('#countdown').text(secs);
                if (currentCountDownSeconds !== secs) {
                    currentCountDownSeconds = secs;

                    // start game when countdown reaches 0, and remove the peer
                    var gameId = new Date().getTime();
                    if (secs <= 0) {
                        var peersClone = getPeersByStatus(STATUS_JOINING).concat();
                        // remove these peers from the queue
                        removePeersFromQueueById(peersClone.map(function(peer) { return peer.peer; }));
                        peersClone.forEach(function(peer) {
                            if (!peersByGameId[gameId]) {
                                peersByGameId[gameId] = [];
                            }
                            peersByGameId[gameId].push(peer);
                            peer.status = STATUS_PLAYING;
                            peer.send({
                                action: 'start',
                                peerIds: peersClone.map(function(peer) { return peer.peer; })
                            });
                        });
                        updatePeersList();
                        resetCountdown();
                    }
                }
            } else {
                countdownStartTime = -1;
                $('#countdown').text('... waiting for at least 2 players');
            }
            requestAnimationFrame(updateCountDown);
        }

        /**
         * Adds a peer into the list.
         * @param {DataConnection} conn
         */
        function addPeer(conn) {
            conn.status = STATUS_IDLE;
            conn.score = '?';
            peersInQueue.push(conn);
        }

        /**
         * Removes a peer from the list.
         * @param {DataConnection} conn
         */
        function removePeer(conn) {
            var i = peersInQueue.length;
            while (--i >= 0) {
                if (peersInQueue[i].peer === conn.peer) {
                    peersInQueue.splice(i, 1);
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
                switch (data.action) {
                    case 'join':
                        conn.status = STATUS_JOINING;
                        resetCountdown();
                        updatePeersList();
                        break;
                }
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