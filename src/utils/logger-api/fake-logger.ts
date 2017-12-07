/**
 * Project
 * Created by ernesto on 9/1/17.
 */
export class FakeLogger {

	constructor() {

		['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal', 'Mark'].forEach((level) => {
			this[level.toLowerCase()] = () => {
			};
			this[`is${level}Enabled`] = () => false;
		});

	}

	log() {
	}

	isLevelEnabled() {
		return false;
	}

	addContext() {
	}

	removeContext() {
	}

	clearContext() {
	}
}
