import {Contact} from "./contact/contact";
/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

export  interface IPartyEntity {

    // Could be person or organization
    type: string;

    // Contact data
    contact: Contact;

    // Account id
    idAccount: string;
}
