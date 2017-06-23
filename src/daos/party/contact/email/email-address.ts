/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import {IContactMethod} from "../contact-method";

export class EmailAddress implements IContactMethod {
    public type: string;
    public primary: boolean;
    public address: string;

    constructor(type: string, primary: boolean, address: string) {
        this.type = type;
        this.primary = primary;
        this.address = address;
    }
}
