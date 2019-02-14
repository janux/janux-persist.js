module.exports = {
	appenders: {
		console: {
			type: "console",
			layout: {
				type: "pattern",
				pattern: "%[%d | %p | %c |%] %m"
			}
		},
		file: {
			type: "file",
			filename: "test.log",
			layout: {
				type: "pattern",
				pattern: "%d | %p | %c | %m"
			}
		},
		FILE: { type: "logLevelFilter", appender: "file", level: "DEBUG" },
		CONSOLE: { type: "logLevelFilter", appender: "console", level: "ERROR" }
	},
	categories: {
		default: { appenders: ["CONSOLE", "FILE"], level: "DEBUG" }
	}
};
