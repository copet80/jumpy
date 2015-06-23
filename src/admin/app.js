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
         * Peer is just waiting to start the game.
         * @type {string}
         */
        var STATUS_STARTING = 'starting';

        /**
         * Peer is playing a game.
         * @type {string}
         */
        var STATUS_PLAYING = 'playing';

        /**
         * How many milliseconds before game starts.
         * @type {number}
         */
        var COUNTDOWN_TIME = 5000;

        /**
         * How many milliseconds before game ends.
         * @type {number}
         */
        var PLAY_TIME = 10000;

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
         * List of end times by game ID.
         * @type {object}
         */
        var endTimesByGameId = {};

        /**
         * Sorting function for peers by their score.
         */
        function sortPeersByScore(a, b) {
            if (a.score > b.score) return -1;
            else if (a.score < b.score) return 1;
            return 0;
        }

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
                        '</tr>');
                    $('#players-list .queue tbody').append(row);
                });
            }
        }

        /**
         * Updates games list on the page.
         */
        function updateGamesList() {
            if (peersByGameId) {
                Object.keys(peersByGameId).forEach(function(gameId) {
                    var peers = peersByGameId[gameId];
                    var table = tablesByGameId[gameId];
                    if (!table) {
                        table = $('<table id="' + gameId + '" class="table table-condensed table-bordered game">' +
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
                        $('#games-list').append(table);
                    }
                    if (peers.length === 0) {
                        table.remove();
                    } else {
                        table.find('tbody').html(
                            peers.length ? '' : '<tr><td colspan="4">No players yet.</td></tr>'
                        );
                        peers.sort(sortPeersByScore);
                        peers.forEach(function(peerConn, index) {
                            var row = $('<tr id="' + peerConn.peer + '">' +
                                '<td>' + (index + 1) + '</td>' +
                                '<td>' + peerConn.peer + '</td>' +
                                '<td>' + peerConn._peerBrowser + '</td>' +
                                '<td class="score">' + peerConn.score + '</td>' +
                                '</tr>');
                            table.find('tbody').append(row);
                        });
                    }
                });
                // remove game that is already gone
                $('#games-list table.game').each(function(index, table) {
                    if (Object.keys(peersByGameId).indexOf($(table).attr('id')) === -1) {
                        table.remove();
                    }
                });
            } else {
                $('#games-list').html('');
            }
        }

        /**
         * Refreshes game remaining times.
         */
        function refreshGameRemainingTimes() {
            if (endTimesByGameId) {
                Object.keys(endTimesByGameId).forEach(function(gameId) {
                    var endTime = endTimesByGameId[gameId];
                    var countdown = Math.floor((endTime - new Date().getTime()) * 0.001);
                    if (countdown > 0) {
                        $('#games-list #' + gameId + ' .time').text(countdown);
                    } else {
                        // end the game
                        var peers = peersByGameId[gameId];
                        peers.sort(sortPeersByScore);
                        var ranks = peers.map(function(peerConn) {
                            return peerConn.peer;
                        });
                        peers.forEach(function(peer) {
                            peer.send({
                                action: 'end',
                                ranks: ranks
                            });
                        });
                        delete peersByGameId[gameId];
                        delete endTimesByGameId[gameId];
                        updateGamesList();
                    }
                });
            }
            requestAnimationFrame(refreshGameRemainingTimes);
        }

        /**
         * Updates score on peer.
         * @param {DataConnection} peerConn
         */
        function updateScore(peerConn) {
            $('#games-list #' + peerConn.peer + ' .score').text(peerConn.score);
        }

        /**
         * Resets the states.
         */
        function reset() {
            currentCountDownSeconds = -1;
            countdownStartTime = -1;
            peersInQueue = [];
            peersByGameId = {};
            endTimesByGameId = {};
            updatePeersList();
            updateGamesList();
            refreshGameRemainingTimes();
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
            var joiningPeers = getPeersByStatus(STATUS_JOINING);
            var startingPeers = getPeersByStatus(STATUS_STARTING);

            if (joiningPeers.length >= 2 || startingPeers.length >= 2) {
                resetCountdown();
                joiningPeers.forEach(function(peerConn) {
                    if (peerConn.status === STATUS_JOINING) {
                        peerConn.status = STATUS_STARTING;
                        peerConn.send({
                            action: 'startTime',
                            startTime: countdownStartTime + COUNTDOWN_TIME,
                            globalTime: new Date().getTime()
                        });
                    }
                });
            }

            if (startingPeers.length >= 2) {
                var now = new Date().getTime();
                var secs = Math.floor((COUNTDOWN_TIME - (now - countdownStartTime)) * 0.001);
                $('#countdown').text(secs);

                if (currentCountDownSeconds !== secs) {
                    currentCountDownSeconds = secs;

                    // start game when countdown reaches 0, and remove the peer
                    var gameId = new Date().getTime();
                    if (secs <= 0) {
                        var peersClone = getPeersByStatus(STATUS_STARTING).concat();
                        // remove these peers from the queue
                        removePeersFromQueueById(peersClone.map(function(peer) { return peer.peer; }));
                        peersClone.forEach(function(peer) {
                            if (!peersByGameId[gameId]) {
                                peersByGameId[gameId] = [];
                            }
                            peersByGameId[gameId].push(peer);
                            endTimesByGameId[gameId] = new Date().getTime() + PLAY_TIME;
                            peer.status = STATUS_PLAYING;
                            peer.send({
                                action: 'start',
                                endTime: endTimesByGameId[gameId],
                                peerIds: peersClone.map(function(peer) { return peer.peer; })
                            });
                        });
                        updatePeersList();
                        updateGamesList();
                        resetCountdown();
                    }
                }
            } else {
                countdownStartTime = -1;
                $('#countdown').text('... waiting for at least 2 players');

                startingPeers.forEach(function(peerConn) {
                    if (peerConn.status === STATUS_STARTING) {
                        peerConn.status = STATUS_JOINING;
                        peerConn.send({
                            action: 'wait'
                        });
                    }
                });
            }
            requestAnimationFrame(updateCountDown);
        }

        /**
         * Adds a peer into the list.
         * @param {DataConnection} conn
         */
        function addPeer(conn) {
            conn.status = STATUS_IDLE;
            conn.score = '0';
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
            Object.keys(peersByGameId).forEach(function(gameId) {
                var peers = peersByGameId[gameId];
                var i = peers.length;
                var peerToDestroy;
                while (--i >= 0) {
                    if (peers[i].peer === conn.peer) {
                        peers.splice(i, 1);
                        break;
                    }
                }
            });
        }

        /**
         * Peer object for this admin.
         * @type {Peer}
         */
        var peer = new Peer('jumpyadmin', {
            //key: 'apv9cn0q4669wwmi',
            port: 9999,
            host: 'localhost'
            //host: 'anthonytdt.objective.com'
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
                console.log('[CONNECTION DATA]', data, conn);
                switch (data.action) {
                    case 'join':
                        conn.status = STATUS_JOINING;
                        resetCountdown();
                        updatePeersList();
                        break;

                    case 'score':
                        conn.score = data.score;
                        updateScore(conn);
                        break;
                }
            });
            conn.on('close', function() {
                console.log('[CONNECTION CLOSE]');
                removePeer(conn);
                updatePeersList();
                updateGamesList();
            });
            conn.on('error', function(error) {
                console.error('[CONNECTION ERROR]', error);
                removePeer(conn);
                updatePeersList();
                updateGamesList();
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