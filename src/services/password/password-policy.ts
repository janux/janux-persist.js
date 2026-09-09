/*
 * Project janux-persist.js
 */

/**
 * A password policy: the length range a new or changed password must fall
 * within, plus a composition rule (`pattern`) it must also match. `pattern`
 * is a regex *source string*, not a RegExp instance - this policy crosses a
 * JSON boundary (each app's public config/policy endpoint) to reach
 * client-side validation, and `JSON.stringify(someRegExp)` serializes to
 * `{}`, silently losing the rule. Build the RegExp at the point of use:
 * `new RegExp(policy.pattern)`.
 */
export interface PasswordPolicy {
	minLength: number;
	maxLength: number;
	pattern: string;
}

/**
 * The shared default password policy: 12-32 characters, and `pattern`
 * requires at least one letter, one digit and one non-alphanumeric
 * character. (JAM-25 originally shipped length-only, on the reasoning that
 * a password manager's generated output shouldn't be rejected for
 * including symbols - composition rules were added back on top of that by
 * explicit request, not because the length-only reasoning was wrong: a
 * password manager's default output already satisfies this pattern, so
 * nothing that cleared the old rule is rejected by this one.)
 *
 * This is the single source of truth for easytitle24-2.x, glarus-ops and
 * janux-portal - each app's own `config/default.js` should read this value
 * rather than hard-coding it, so all three agree by default. An app that
 * genuinely needs a different policy overrides it in its own
 * `config/local.js` (or environment-specific config), same as any other
 * node-config value - see CODE_CONVENTIONS.md.
 */
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
	minLength: 12,
	maxLength: 32,
	pattern: "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$"
};

/**
 * Whether `password` satisfies `policy` (DEFAULT_PASSWORD_POLICY unless a
 * caller passes its own): within the length range, and matching `pattern`.
 * No dependencies - safe to call from both server-side enforcement and, via
 * whatever mechanism a client fetches the policy through, to validate the
 * same rule client-side.
 */
export function isPasswordValid(password: string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): boolean {
	if (typeof password !== "string") {
		return false;
	}
	if (password.length < policy.minLength || password.length > policy.maxLength) {
		return false;
	}
	return new RegExp(policy.pattern).test(password);
}
