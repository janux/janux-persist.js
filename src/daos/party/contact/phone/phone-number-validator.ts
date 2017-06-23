/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as logger from 'log4js';
import {ValidationError} from "../../../../persistence/impl/validation-error";
import {isBlank} from "../../../../util/blank-string-validator";
import {ContactValidator} from "../contact-validator";
import {PhoneNumber} from "./phone-number";

export class PhoneNumberValidator {

    public static readonly CONTACT_PHONE = "contacts.phone.number";
    public static readonly NUMBER_EMPTY = "The number is empty";

    public static validatePhoneNumber(phone: PhoneNumber): ValidationError[] {
        this._log.debug("Call to validatePhoneNumber with phone: %j", phone);
        let errors: ValidationError[] = [];
        errors = errors.concat(ContactValidator.validateBaseContactInfo("contact.phone", phone));
        if (isBlank(phone.number)) {
            errors.push(new ValidationError(this.CONTACT_PHONE, this.NUMBER_EMPTY, ""));
        }
        this._log.debug("Returning %j ", errors);
        return errors;
    }

    private static _log = logger.getLogger("PhoneNumberValidator");
}
