/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import {Contact} from "../contact/contact";
import {IPartyEntity} from "../iParty-entity";
import {PersonName} from "./person-name";

export class PersonEntity implements IPartyEntity {
    public id: string;
    public idAccount: string;
    public type: string;
    public name: PersonName = new PersonName();

    public contact: Contact = new Contact();
}
