var gulp = require('gulp');
var server = require('gulp-express');
var webserver = require('gulp-webserver');
var async = require('async');

gulp.task('admin', function(done) {
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

gulp.task('server', function() {
    gulp
        .src('src')
        .pipe(webserver({
            host: 'anthonytdt.objective.com',
            port: 8888,
            livereload: true,
            directoryListing: true,
            fallback: 'index.html'
        }));
});