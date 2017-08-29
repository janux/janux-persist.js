'use strict';
//
// compile TypeScript files
//

var path = require('path'),
    ts = require('gulp-typescript'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    tslint = require('gulp-tslint'),
    merge = require('merge2');

module.exports = function (gulp) {

    var cfg = gulp.cfg;
    var tsProject = ts.createProject(cfg.tsConfig);

    //
    // Lint all custom TypeScript files.
    //
    gulp.task('ts-lint', function () {
        console.log('linting ts files...');
        return gulp.src(cfg.fileset.ts).pipe(tslint({formatter: "prose"})).pipe(tslint.report());
    });

    //
    // Compile TypeScript and include references to library and app .d.ts files.
    //
    gulp.task('compile', ['ts-lint'], function () {
        console.log('compiling ts files...');
        return merge([
            gulp.src(cfg.fileset.ts)
                .pipe(sourcemaps.init()) // This means sourcemaps will be generated
                .pipe(ts(cfg.tsConfig))
                .pipe(sourcemaps.write()) // sourcemaps are added to the .js file
                .pipe(gulp.dest(path.join(cfg.dir.dist)))
        ]);
    });

    //
    // Compile the typescripts files. The difference is that,
    // according with the website, the task performs
    // 'incremental' compilation, which is faster than normal
    //
    gulp.task('compile:fast', ['ts-lint'], function () {
        console.log("Compiling ts files fast");
        var tsResult = gulp.src(cfg.fileset.ts).pipe(sourcemaps.init()).pipe(tsProject());
        return merge([
            tsResult.dts.pipe(gulp.dest(cfg.dir.dist)),
            tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest(cfg.dir.dist))
        ])
    });

		gulp.task('fast', ['compile:fast']);

};

