/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

export class UserEntity {

    public id: string;
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
}
