'use strict';
var fs   = require('fs'),
    through2 = require("through2").obj,
    imageResize = require('gulp-image-resize'),
    gulp = require('gulp'),
    resizeImg = require('resize-img'),
    del = require('del'),
    changed = require('gulp-changed'),
    runSequence = require('run-sequence');

var __ = function(settings) {
    this.thumbnailsClear = settings.thumbnailsClear;
};

__.refreshThumbnails = function(dir) {
    var taskDependencies = [];

    if(this.thumbnailsClear) {
        taskDependencies.push("thumbnails-clear");
        gulp.task('thumbnails-clear', function() {
            return del(dir + '/design-thumbnails/**/*.{jpg,jpeg,png}');
        });
    }

    taskDependencies.push("sync-thumbnails");
    gulp.task("sync-thumbnails", function () {
        return gulp.src([dir + '/**/*.{jpg,jpeg,png}', '!' + dir + '/design-thumbnails/**/*.*'])
            .pipe(changed(dir + '/design-thumbnails'))
            .pipe(through2(function(file, enc, callback){
                resizeImg(file.contents, {width: 320}).then(buf => {
                    file.contents = buf;
                    callback(null, file);
                });
            }))
            .pipe(gulp.dest(dir + '/design-thumbnails'));
    });

    runSequence.apply(null, taskDependencies);

    gulp.watch([dir + '/**/*.{jpg,jpeg,png}', '!' + dir + '/design-thumbnails/**/*.*'], ['sync-thumbnails']);
}

module.exports = __;