/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import {Contact} from "../contact/contact";
import {IPartyEntity} from "../iParty-entity";

export class OrganizationEntity implements IPartyEntity {
    public idAccount: string;
    public type: string;
    public name: string;
    public contact: Contact = new Contact();
}
