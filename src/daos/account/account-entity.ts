/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

export class AccountEntity {

    public username: string;
    public password: string;
    public enabled: boolean;
    public locked: boolean;
    public expire: Date;
    public expirePassword: Date;

    // With this id, you can know the contact associated with this account
    public contactId: string;
}
