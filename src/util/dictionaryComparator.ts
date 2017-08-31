/**
 * Project
 * Created by ernesto on 8/28/17.
 */

/**
 * Compare if two dictionaries shares the same keys and the
 * same values.
 * @param {{}} val1
 * @param {{}} val2
 */
export function isDictionaryEqual(val1: {}, val2: {}) {
	const keys1: string[] = Object.keys(val1);
	const keys2: string[] = Object.keys(val2);
	if (keys1.length !== keys2.length) {
		return false;
	}
	for (const key of keys1) {
		if (val1[key] !== val2[key]) {
			return false;
		}
	}
	return true;
}
