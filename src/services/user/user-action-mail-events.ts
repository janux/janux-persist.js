/**
 * Project janux-persistence
 *
 * Event names for the mail seam UserActionService emits through (janux-mail
 * plan, Step 1c). Exported so every consuming app's own mail-event-names.js
 * references these same string literals rather than duplicating them -
 * that's what keeps the emit side (here) and each app's listen side from
 * drifting apart across a package boundary, the same protection
 * mail-event-names.js gives within a single app.
 */

export const MAIL_EVENT_NAMES = {
	PASSWORD_RECOVERY_REQUESTED: "password.recoveryRequested",
	USER_INVITED: "user.invited"
};
