/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */
import {PostalAddress} from "./address/postal-address";
import {EmailAddress} from "./email/email-address";
import {PhoneNumber} from "./phone/phone-number";

export class Contact {

    public phones: PhoneNumber[] = [];

    public emails: EmailAddress[] = [];

    public addresses: PostalAddress[] = [];

}
