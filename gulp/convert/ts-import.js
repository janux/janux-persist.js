/**
 * Project glarus-services
 * Created by ernesto on 10/2/17.
 */
var through = require('through2');

var replacePath = require("./replace-path.js");

module.exports = function (importOptions) {
	return through.obj(function (file, enc, cb) {
		var code = file.contents.toString('utf8');

		code = replacePath(code, file.history.toString(), importOptions.baseUrl, importOptions.paths, importOptions.outDir);

		file.contents = new Buffer(code);
		this.push(file);
		cb();
	});

};
