/**
 * Project janux-persistence
 * Created by hielo on 2018-08-18.
 */

/**
 * User entity.
 */
export class AccountInvitationEntity {
	public id: any;
	public accountId: string;
	public code: string;
	public type: string;
	public expire: Date;
	public status: string;

	/**
	 * Never serialize the invitation/recovery code - it's a single-use bearer
	 * credential (create an account, or take one over) until spent, same as
	 * a password. JSON.stringify() and log4js's %j both call this when
	 * present, so every log statement or API response that runs an
	 * AccountInvitationEntity through either gets this for free. Direct
	 * property access (this.code) is unaffected - the validation that
	 * compares it against a caller-supplied code still works normally.
	 */
	public toJSON(): any {
		const clone: any = Object.assign({}, this);
		delete clone.code;
		return clone;
	}
}
