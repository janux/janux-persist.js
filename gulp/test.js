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
    gulp.task('compile-tests', function () {
        return gulp.src([cfg.fileset.ts])
            .pipe(sourcemaps.init())
            .pipe(ts(cfg.tsConfig))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(path.join(cfg.dir.dist)))
    });

    gulp.task('run-tests', ['ts-lint', 'compile-tests'], function () {
        return gulp.src(cfg.fileset.test, {read: false})
            .pipe(mocha({reporter: cfg.mocha.reporter}));
    });
};
