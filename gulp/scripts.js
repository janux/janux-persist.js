'use strict';
//
// compile TypeScript files
//

var path = require('path'),
	ts = require('gulp-typescript'),
	tslint = require('gulp-tslint'),
	sourcemaps = require('gulp-sourcemaps'),
	tsimport = require('./convert/ts-import');

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

	gulp.task('compile', ['ts-lint'], function (done) {

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
};

