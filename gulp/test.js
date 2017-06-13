'use strict';
//
// compile and run TypeScript test files
//

var path = require('path'),
    ts = require('gulp-typescript'),
    mocha = require('gulp-mocha'),
    sourcemaps = require('gulp-sourcemaps');

module.exports = function (gulp) {

    var cfg = gulp.cfg;

    //
    // Compile TypeScript and include references to library and app .d.ts files.
    //
    gulp.task('ts-plus-test', function () {
        // return  gulp.src([cfg.fileset.ts, cfg.fileset.tsTest])
        return gulp.src([cfg.fileset.ts])
            .pipe(sourcemaps.init())
            .pipe(ts(cfg.tsConfig))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(path.join(cfg.dir.dist)))
        //.pipe(gulp.dest(function(file) {
        //   return file.base;
        //}));
    });

    gulp.task('run-tests', ['set-test-node-env','ts-plus-test'], function () {
        return gulp.src(cfg.fileset.test, {read: false})
            .pipe(mocha({reporter: 'nyan'}));
    });

    gulp.task('set-test-node-env', function() {
        return process.env.NODE_ENV = 'test';
    });
};
