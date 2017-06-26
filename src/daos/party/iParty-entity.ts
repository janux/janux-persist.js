/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import {IEntity} from "../../persistence/interfaces/entity";
import {Contact} from "./contact/contact";

export  interface IPartyEntity extends IEntity {

    // Could be person or organization
    type: string;

    // Contact data
    contact: Contact;

    // Account id
    idAccount: string;
}
