/**
 * Connection strings carry the database credentials (mongodb://user:password@host/db), and the
 * log is no place for them at any level: DEBUG and TRACE get switched on in a live environment
 * sooner or later (JAM-152). Every log statement that mentions a data source path goes through
 * this, so nobody has to remember it at the next log line.
 */

// scheme://, then everything up to the last "@" before a "?", "#" or whitespace. Greedy on
// purpose: a password that contains an unescaped "/" or "@" must not leave a fragment behind.
const CREDENTIALS_IN_URL = /([a-z][a-z0-9+.-]*:\/\/)[^\s?#]*@/gi;

/**
 * Returns the value with the credential segment of every URL in it removed:
 * "mongodb://user:pass@host-1,host-2/db?authSource=admin" becomes
 * "mongodb://host-1,host-2/db?authSource=admin". Anything without credentials, such as a LokiJS
 * file path, is returned unchanged, and so is anything that is not a string.
 *
 * It works on text as well as on a bare URL, so it can be applied to an error message that might
 * quote the connection string.
 */
export function redactConnectionUrl<T>(value: T): T {
	if (typeof value !== "string") {
		return value;
	}
	return (value.replace(CREDENTIALS_IN_URL, "$1") as unknown) as T;
}
