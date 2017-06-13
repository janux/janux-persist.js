/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import {PersonImpl} from "janux-people.js";
import {iAccount} from "janux-security";

export class Account implements iAccount {
    public username: string;
    public password: string;
    public enabled: boolean;
    public locked: boolean;
    public expire: Date;
    public expirePassword: Date;
    public contact: PersonImpl;

    // List of roles
    public roles: string[];
}
