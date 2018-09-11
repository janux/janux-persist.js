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
}
