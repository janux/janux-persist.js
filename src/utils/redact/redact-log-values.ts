/**
 * Keeps the values of sensitive attributes out of the log lines a DAO writes for its queries
 * (JAM-80). A DAO declares which of its attribute names are sensitive (for example an
 * invitation's "code", which is a bearer token), and every statement that logs a query, an
 * attribute filter or an attribute value goes through these, so the value is replaced by a
 * marker while the rest of the query stays readable. It is declared per DAO rather than guessed
 * from a list of names, so a field that merely happens to be called "code" elsewhere is not
 * hidden.
 */

export const REDACTED = "[redacted]";

function isPlainObject(value: any): boolean {
	return value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
}

function isSensitive(attributeName: any, sensitive: string[] | undefined): boolean {
	return Array.isArray(sensitive) && sensitive.indexOf(attributeName) !== -1;
}

/**
 * The value to log for an attribute: a marker if the attribute is sensitive, else the value itself.
 */
export function loggableValue(attributeName: string, value: any, sensitive: string[] | undefined): any {
	return isSensitive(attributeName, sensitive) ? REDACTED : value;
}

/**
 * The values to log for an attribute matched against a list of values.
 */
export function loggableValues(attributeName: string, values: any[], sensitive: string[] | undefined): any {
	return isSensitive(attributeName, sensitive) ? REDACTED : values;
}

/**
 * A copy of the attribute filters with the value of each sensitive attribute replaced.
 */
export function loggableFilters(filters: any, sensitive: string[] | undefined): any {
	if (!Array.isArray(filters) || !Array.isArray(sensitive) || sensitive.length === 0) {
		return filters;
	}
	return filters.map(filter =>
		filter && isSensitive(filter.attributeName, sensitive) ? { attributeName: filter.attributeName, value: REDACTED } : filter
	);
}

/**
 * A copy of a mongo-style query with everything under a sensitive attribute's name replaced,
 * however it is written ({ code: "x" } or { code: { $eq: "x" } }) and however deep it is nested
 * ($and / $or lists).
 */
export function loggableQuery(query: any, sensitive: string[] | undefined): any {
	if (!Array.isArray(sensitive) || sensitive.length === 0) {
		return query;
	}
	if (Array.isArray(query)) {
		return query.map(item => loggableQuery(item, sensitive));
	}
	if (isPlainObject(query)) {
		const result: any = {};
		Object.keys(query).forEach(key => {
			result[key] = isSensitive(key, sensitive) ? REDACTED : loggableQuery(query[key], sensitive);
		});
		return result;
	}
	return query;
}
