/**
 * Project janux-persistence
 *
 * Captures every log statement janux-persist makes, at every level, whatever the configured
 * threshold: it intercepts log4js's Logger below the level check, so a DEBUG or TRACE statement is
 * caught even though the suite runs at a higher level. Used by the specs that assert a secret
 * never reaches a log line (JAM-152, JAM-80).
 *
 *   var capture = require("../util/log-capture");
 *   before(capture.install); after(capture.uninstall);
 *   beforeEach(capture.reset);
 *   ... capture.entries()  // [{ level, category, text }]
 */
var util = require("util");
var log4js = require("log4js");

var LEVELS = ["trace", "debug", "info", "warn", "error", "fatal", "mark"];
var loggerPrototype = Object.getPrototypeOf(log4js.getLogger("log-capture"));
var originals = {};
var captured = [];

function render(args) {
	var rendered = [util.format.apply(null, args)];
	args.forEach(function(arg) {
		try {
			rendered.push(typeof arg === "string" ? arg : JSON.stringify(arg));
		} catch (e) {
			rendered.push(String(arg));
		}
	});
	return rendered.join(" | ");
}

module.exports = {
	install: function() {
		LEVELS.forEach(function(level) {
			originals[level] = loggerPrototype[level];
			loggerPrototype[level] = function() {
				captured.push({ level: level, category: this.category, text: render(Array.prototype.slice.call(arguments)) });
				return originals[level].apply(this, arguments);
			};
		});
	},

	uninstall: function() {
		LEVELS.forEach(function(level) {
			loggerPrototype[level] = originals[level];
		});
	},

	reset: function() {
		captured = [];
	},

	entries: function() {
		return captured;
	},

	/** The captured lines that contain any of the given secret values. */
	leaks: function(secrets) {
		return captured.filter(function(entry) {
			return secrets.some(function(secret) {
				return secret && entry.text.indexOf(secret) !== -1;
			});
		});
	}
};
