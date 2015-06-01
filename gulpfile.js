var gulp = require('gulp');
var server = require('gulp-express');
var async = require('async');

gulp.task('server', function(done) {
    server.run(['server.js']);
    gulp.watch(['server.js', 'src/admin/app.js'], function() {
        async.series([
            function(callback) {
                server.stop();
                callback();
            },
            function() {
                server.run(['server.js']);
            }
        ]);
    });
});