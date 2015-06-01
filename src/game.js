(function() {
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
            if (data === 'start') {
                // start game and remove connection to admin
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