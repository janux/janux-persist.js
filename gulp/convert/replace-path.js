/**
 * Project janux-persis
 * Created by ernesto on 10/2/17.
 */
var fs = require("fs");
var path = require("path");

module.exports = function(code, filePath, rootPath, targetPaths, outDir) {
	var tscpaths = Object.keys(targetPaths);

	var lines = code.split("\n");

	return lines
		.map(function(line) {
			var matches = [];
			var require_matches = line.match(/require\(('|")(.*)('|")\)/g);
			// var import_matches = line.match(/import ('|")(.*)('|")/g);

			Array.prototype.push.apply(matches, require_matches);
			// Array.prototype.push.apply(matches, import_matches);

			if (!matches) {
				return line;
			}

			// Go through each require statement
			for (var i = 0; i < matches.length; i++) {
				var match = matches[i];
				// Find each paths
				for (var j = 0; j < tscpaths.length; j++) {
					var tscpath = tscpaths[j];
					// Find required module & check if its path matching what is described in the paths config.
					var requiredModules = match.match(new RegExp(tscpath, "g"));

					if (requiredModules && requiredModules.length > 0) {
						for (var k = 0; k < requiredModules.length; k++) {
							// Skip if it resolves to the node_modules folder
							var modulePath = path.resolve("./node_modules/" + tscpath);
							if (fs.existsSync(modulePath)) {
								continue;
							}

							// Get relative path and replace
							var sourcePath = path.dirname(filePath);
							var targetPath = path.dirname(path.resolve(outDir + "/" + targetPaths[tscpath]));

							var relativePath = path.relative(sourcePath, targetPath);

							line = line.replace(new RegExp(tscpath, "g"), "./" + relativePath + "/");
						}
					}
				}
			}

			return line;
		})
		.join("\n");
};
