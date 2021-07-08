"use strict";
//
// Clean build and doc
//

var del = require("del"),
	path = require("path");

module.exports = function(gulp) {
	var cfg = gulp.cfg;

	//
	// Remove all generated JavaScript files from TypeScript compilation process.
	//
	gulp.task("clean", (cb) => {
		console.log("cleaning " + cfg.dir.dist + " directory...");
		// delete the files
		del([path.join(cfg.dir.dist, "**", "*")]);
		cb();
	});

	//
	// Remove all generated TypeScript docs.
	//
	gulp.task("clean:doc", (cb) => {
		console.log("cleaning ts documentation client...");
		// delete the files
		del([path.join(cfg.dir.doc, "*")]);
		cb();
	});
};
