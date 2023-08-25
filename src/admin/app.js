(function() {
    /**
     * Connects using PeerJS key to the cloud.
     * @type {number}
     */
    const MODE_LIVE = 0;

    /**
     * Connects to host specified in the host.
     * @type {number}
     */
    const MODE_HOST = 1;

    /**
     * Connects to local.
     * @type {number}
     */
    const MODE_LOCALHOST = 2;

    /**
     * Connection mode.
     * @see MODE_LIVE
     * @see MODE_DEV
     * @see MODE_LOCAL
     */
    var MODE = MODE_LOCALHOST;

    /**
     * Host to connect to when MODE_HOST is used.
     * @type {string}
     */
    var host = 'jumpy.anthonytambrin.com';

    /**
     * Port to run socket on.
     * @type {number}
     */
    var port = 9999;

    $(document).ready(function() {
        const ANIMALS = [
            "Bat",
            "Brown Bear",
            "Cat",
            "Crocodile",
            "Duck",
            "Elephant",
            "Fox",
            "Frog",
            "Hamster",
            "Hippo",
            "Horse",
            "Koala",
            "Lion",
            "Monkey",
            "Moose",
            "Panda",
            "Parrot",
            "Penguin",
            "Pig",
            "Polar Bear",
            "Rabbit",
            "Rhino",
            "Shark",
            "Sheep",
            "Snow Owl",
            "Tiger",
            "Walrus",
            "Wolf"
        ];
        
        /**
         * @private
         * Debug mode.
         * @type {boolean}
         */
        const DEBUG = false;

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
        var COUNTDOWN_TIME = 20000;

        /**
         * How many milliseconds before game ends.
         * @type {number}
         */
        var PLAY_TIME = 60000;

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
         * Adds game result entry.
         * @param {PeerConnection[]} winners
         */
        function addResult(winners) {
            var createPeerColumn = function(peerConn) {
                var column = $('<td></td>');
                if (peerConn) {
                    var animal = $('<div class="animal"></div>');
                    animal.css("background-position", "0 " + (ANIMALS.indexOf(peerConn.animalId) * -44) + "px");
                    var score = $('<div class="score">' + peerConn.score + '</div>');
                    column.append(animal);
                    column.append(score);
                }
                return column;
            };

            if ($('#game-results tbody tr').text().trim() === 'No results yet.') {
                $('#game-results tbody').html('');
            }

            var row = $('<tr></tr>');
            row.append($('<td>' + moment().format('DD/MM/YYYY HH:mm:ss') + '</td>'));
            row.append(createPeerColumn(winners[0]));
            row.append(createPeerColumn(winners[1]));
            row.append(createPeerColumn(winners[2]));
            $('#game-results tbody').append(row);
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
                            '<th colspan="5">' +
                            'Game #<span class="game-id">' + gameId + '</span>' +
                            '<br>' +
                            'Remaining Time: <span class="time"></span>' +
                            '</th>' +
                            '</tr>' +
                            '<tr>' +
                            '<th>#</th>' +
                            '<th>Animal</th>' +
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
                        if (peers.length === 0) {
                            table.find('tbody').html('<tr><td colspan="4">No players yet.</td></tr>');
                        } else {
                            peers.sort(sortPeersByScore);
                            peers.forEach(function(peerConn, index) {
                                var rows = table.find('tbody tr');
                                var row;
                                if (rows.length < peers.length) {
                                    row = $('<tr>' +
                                        '<td class="index"></td>' +
                                        '<td class="animal"></td>' +
                                        '<td class="id"></td>' +
                                        '<td class="browser"></td>' +
                                        '<td class="score"></td>' +
                                        '</tr>');
                                    table.find('tbody').append(row);
                                } else {
                                    row = $(rows[index]);
                                }
                                row.attr('id', peerConn.peer);
                                row.find('td.index').text(index + 1);
                                row.find('td.animal').css("background-position", "0 " + (ANIMALS.indexOf(peerConn.animalId) * -44) + "px");
                                row.find('td.id').text(peerConn.peer);
                                row.find('td.browser').text(peerConn._peerBrowser);
                                row.find('td.score').text(peerConn.score);
                            });
                        }
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
                        addResult(peers);
                        delete peersByGameId[gameId];
                        delete endTimesByGameId[gameId];
                        updateGamesList();
                    }
                });
            }
            requestAnimationFrame(refreshGameRemainingTimes);
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
         * @private
         * Console log.
         * @param {string} text
         */
        function log(text) {
            if (DEBUG) {
                console.log(text);
            }
        }

        /**
         * Peer object for this admin.
         * @type {Peer}
         */
        var peer;
        switch (MODE) {
            case MODE_LIVE:
                peer = new Peer('jumpyadmin', {
                    key: 'apv9cn0q4669wwmi'
                });
                break;

            case MODE_LOCALHOST:
                peer = new Peer('jumpyadmin', {
                    port: port,
                    host: 'jumpy.anthonytambrin.local'
                });
                break;

            case MODE_HOST:
                peer = new Peer('jumpyadmin', {
                    port: port,
                    host: host
                });
                break;
        }

        peer.on('open', function(id) {
            log('[OPEN] Peer ID: ' + id);
            reset();
            updateCountDown();
        });
        peer.on('connection', function(conn) {
            log('[CONNECTION] Connection...', conn);
            conn.on('open', function() {
                log('[CONNECTION OPEN]');
                addPeer(conn);
                updatePeersList();
            });
            conn.on('data', function(data) {
                log('[CONNECTION DATA]', data, conn);
                switch (data.action) {
                    case 'join':
                        conn.status = STATUS_JOINING;
                        resetCountdown();
                        updatePeersList();
                        break;

                    case 'score':
                        conn.score = data.score;
                        updateGamesList();
                        break;

                    case 'animal':
                        conn.animalId = data.animalId;
                        updateGamesList();
                        break;
                }
            });
            conn.on('close', function() {
                log('[CONNECTION CLOSE]');
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
            log('[CLOSE]');
        });
        peer.on('disconnected', function() {
            log('[DISCONNECTED]');
        });
        peer.on('error', function(error) {
            console.error('[ERROR]', error);
        });
    });
})();