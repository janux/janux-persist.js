/**
 * Project janux-persist.js
 * Created by ernesto on 10/9/17.
 */
var through = require("through2");
var replacePathDeclaration = require("./replace-path-declaration");

module.exports = function(importOptions) {
	return through.obj(function(file, enc, cb) {
		var code = file.contents.toString("utf8");
		code = replacePathDeclaration(
			code,
			file.history.toString(),
			importOptions.baseUrl,
			importOptions.paths,
			importOptions.outDir
		);
		file.contents = new Buffer(code);
		this.push(file);
		cb();
	});
};
