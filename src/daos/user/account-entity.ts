/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

/**
 * User entity.
 */
export class AccountEntity {
	public id: any;
	public username: string;
	public password: string;
	public userId: string;
	public mdate: Date;
	public cdate: Date;
	public enabled: boolean;
	public locked: boolean;
	public expire: Date;
	public expirePassword: Date;

	// With this id, you can know the contact associated with this account
	public contactId: string;

	public roles: string[];

	/**
	 * Whether this account is allowed to authenticate right now, independent
	 * of whether the supplied password is correct.
	 *
	 * `enabled` fails closed: it must be exactly `true`. An account that
	 * predates this field, or whose `enabled` flag was never explicitly set,
	 * does not get to sign in - verified against real account data before
	 * settling on this (JAM-24): easytitle24-2.x's restored production dump
	 * has `enabled` explicitly set on every account, so this only excludes
	 * accounts that were genuinely never enabled.
	 *
	 * `locked` and `expire` default open when absent - "never set" naturally
	 * reads as "not locked" / "never expires" for those two, unlike
	 * `enabled`.
	 *
	 * `expirePassword` is deliberately not part of this predicate. Unlike
	 * the other three it shouldn't block sign-in outright - it should force
	 * a password change on the way in, which is a real flow to build, not a
	 * boolean check (see JAM-45).
	 */
	public canAuthenticate(): boolean {
		if (this.enabled !== true) {
			return false;
		}
		if (this.locked) {
			return false;
		}
		if (this.expire && this.expire < new Date()) {
			return false;
		}
		return true;
	}
}
