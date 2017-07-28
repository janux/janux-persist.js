/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as JanuxPeople from "janux-people.js";
import {ValidationError} from "../../../../persistence/impl/validation-error";
import {isBlankString} from "../../../../util/blank-string-validator";
import {LoggerFactory} from "../../../../util/logger-factory/logger_factory";

export class PhoneNumberValidator {

    public static readonly CONTACT_PHONE = "contacts.phone.number";
    public static readonly NUMBER_EMPTY = "The number is empty";

    public static validatePhoneNumber(phone: JanuxPeople.PhoneNumber): ValidationError[] {
        this._log.debug("Call to validatePhoneNumber with phone: %j", phone);
        const errors: ValidationError[] = [];
        if (isBlankString(phone.number)) {
            errors.push(new ValidationError(this.CONTACT_PHONE, this.NUMBER_EMPTY, ""));
        }
        this._log.debug("Returning %j ", errors);
        return errors;
    }

    private static _log = LoggerFactory.getLogger("PhoneNumberValidator");
}
