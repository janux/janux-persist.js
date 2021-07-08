"use strict";

var gulp = require("gulp"),
	 $   = require('gulp-load-plugins')()

if (!gulp.cfg) {
	gulp.cfg = require("config");
} else {
	// in the event that gulp decides to define a 'gulp.cfg' field
	console.error("gulp.cfg is defined, cannot override!");
}

// App package available for gulp config
gulp.cfg.pkg = require("./package.json");

// Load all the tasks that are defined in the 'gulp' folder.
$.loadSubtasks('gulp', $)

//
// Compile typescript project
//
gulp.task("default", gulp.series("clean", "compile"));

//
// Compile and run tests for typescript project
//
gulp.task("test", gulp.series("compile-test", "run-test"));

//
// Generate documentation from typescript project
//
gulp.task("doc", gulp.series("clean:doc", "typedoc"));
