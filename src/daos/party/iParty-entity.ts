/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import {PostalAddress} from "./contact/address/postal-address";
import {EmailAddress} from "./contact/email/email-address";
import {PhoneNumber} from "./contact/phone/phone-number";

export  interface IPartyEntity {

    id: string;

    // Could be person or organization
    type: string;

    displayName: string;

    phones: PhoneNumber[];

    emails: EmailAddress[];

    addresses: PostalAddress[];

    // Account id
    idAccount: string;
}
