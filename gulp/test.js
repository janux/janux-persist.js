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

    gulp.task('run-tests', ['ts-lint', 'compile'], function () {
        return gulp.src(cfg.fileset.test, {read: false})
            .pipe(mocha({reporter: cfg.mocha.reporter}));
    });
};
