import config = require("config");
import { FakeLogger } from "./fake-logger";

const log4js = checkForLog4js();
configureForLocalDevLink();

/**
 * The prefix every category registered through getLogger() is given, so a
 * combined log stream in a consuming app can tell janux-persist's lines
 * apart from its own or another dependency's. A consuming app can override
 * it by defining "januxPersist.logCategoryPrefix" in its own config (e.g.
 * to "" to turn the prefix off, or to something else entirely).
 */
const CATEGORY_PREFIX_CONFIG_KEY = "januxPersist.logCategoryPrefix";
const DEFAULT_CATEGORY_PREFIX = "jnx-persist:";
const categoryPrefix: string = config.has(CATEGORY_PREFIX_CONFIG_KEY)
	? config.get(CATEGORY_PREFIX_CONFIG_KEY)
	: DEFAULT_CATEGORY_PREFIX;

function checkForLog4js() {
	// console.log("Calling checkForLog4js");
	try {
		// console.log("log4js found");
		return require("log4js");
	} catch (e) {
		// console.log("log4js not found");
		return null;
	}
}

/**
 * TEMPORARY, dev-link-only (JAM-79): when this package is symlinked into a
 * consumer via janux/bin/dev-link, its own require("log4js") above resolves
 * to its own separate, never-configured log4js instance instead of the
 * consumer's shared, already-configured one - so none of this package's
 * logging shows up anywhere. JNX_PERSIST_DEV_LOG_FILE is a manual escape
 * hatch: set it (only ever by hand, for a local dev-link session) to point
 * this package's own instance at a file, e.g. one sitting next to the
 * consumer's own server.log, so its output can be reviewed side by side.
 * Never set outside that - remove this once JAM-79 has a real fix.
 */
function configureForLocalDevLink() {
	const devLogFile = process.env.JNX_PERSIST_DEV_LOG_FILE;
	if (log4js && devLogFile) {
		log4js.configure({
			appenders: { devFile: { type: "file", filename: devLogFile } },
			categories: { default: { appenders: ["devFile"], level: "debug" } }
		});
	}
}

export function getLogger(path) {
	return log4js ? log4js.getLogger(categoryPrefix + path) : new FakeLogger();
}
