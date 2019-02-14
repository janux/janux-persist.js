"use strict";
//
// compile TypeScript files
//

var path = require("path"),
	ts = require("gulp-typescript"),
	tsLint = require("gulp-tslint"),
	tsImport = require("./convert/ts-import"),
	tsimportDeclaration = require("./convert/ts-import-declaration"),
	gulpSequence = require("gulp-sequence");

module.exports = function(gulp) {
	var cfg = gulp.cfg;
	//
	// Lint all custom TypeScript files.
	//
	gulp.task("ts-lint", function() {
		console.log("linting ts files...");
		return gulp
			.src(cfg.fileset.ts)
			.pipe(tsLint({ formatter: "prose" }))
			.pipe(tsLint.report());
	});

	gulp.task("compile", gulpSequence("compileFiles", "fixDeclarationFilesPath"));

	/**
	 * Compile all file with no source maps.
	 */
	gulp.task("compileFiles", ["ts-lint"], function(done) {
		var tsProject = ts.createProject("tsconfig.json", {
			typescript: require("typescript")
		});
		gulp.src(path.join(tsProject.config.compilerOptions.rootDir, "**", "*"))
			.pipe(tsProject())
			.pipe(tsImport(tsProject.config.compilerOptions))
			.on("error", function(error, callback) {
				console.error(error.stack);
				this.emit("end");
			})
			.pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
			.on("end", done);
	});

	/**
	 * Fix declaration files path (.d.ts).
	 * This task is meant to run after the task 'compile' or the task 'compile-test'
	 */
	gulp.task("fixDeclarationFilesPath", [], function(done) {
		var tsProject = ts.createProject("tsconfig.json", {
			typescript: require("typescript")
		});
		gulp.src(path.join(tsProject.config.compilerOptions.outDir, "**", "*.d.ts"))
			.pipe(tsimportDeclaration(tsProject.config.compilerOptions))
			.on("error", function(error, callback) {
				console.error(error.stack);
				this.emit("end");
			})
			.pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
			.on("end", done);
	});
};
