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
	public period: object;
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
}
