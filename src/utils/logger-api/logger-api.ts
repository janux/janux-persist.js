/**
 * Project
 * Created by ernesto on 9/1/17.
 */
import { FakeLogger } from "./fake-logger";

const log4js = checkForLog4js();

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

export function getLogger(path) {
	return log4js ? log4js.getLogger(path) : new FakeLogger();
}
