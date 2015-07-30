/* global require */
var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var request = require('superagent');

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('fetch-next-issues', function () {});

gulp.task('default', ['browser-sync']);
gulp.task('fetch', ['fetch-next-issues']);
