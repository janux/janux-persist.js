'use strict';
//
// compile and run TypeScript test files
//

var path = require('path'),
    ts = require('gulp-typescript'),
    mocha = require('gulp-mocha'),
    sourcemaps = require('gulp-sourcemaps'),
	tsimport = require('./convert/ts-import');

module.exports = function (gulp) {

    var cfg = gulp.cfg;

	/**
	 * Compile with source maps in the js files, useful for debugging.
	 */
	gulp.task('compile-test', ['ts-lint'], function (done) {

		var tsProject = ts.createProject('tsconfig.json', {
			typescript: require('typescript')
		});
		gulp.src(path.join(tsProject.config.compilerOptions.rootDir, "**", "*"))
			.pipe(sourcemaps.init()) // This means sourcemaps will be generated
			.pipe(tsProject())
			.pipe(tsimport(tsProject.config.compilerOptions))
			.on('error', function (error, callback) {
				console.error(error.stack);
				this.emit("end");
			})
			.pipe(sourcemaps.write()) // sourcemaps are added to the .js file
			.pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
			.on("end", done);
	});

    gulp.task('run-tests', ['ts-lint', 'compile-test'], function () {
        return gulp.src(cfg.fileset.test, {read: false})
            .pipe(mocha({reporter: cfg.mocha.reporter}));
    });
};
