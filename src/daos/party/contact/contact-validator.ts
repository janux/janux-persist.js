/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */
import * as _ from 'lodash';
import * as logger from 'log4js';
import {ValidationError} from "../../../persistence/impl/validation-error";
import {isBlankString} from "../../../util/blank-string-validator";
import {IContactMethod} from "./contact-method";

export class ContactValidator {

    public static validateBaseContactInfo(prefix: string, contact: IContactMethod): ValidationError[] {
        this._log.debug("Call to validateBaseContactInfo with prefix: %j contact: %j", prefix, contact);
        const errors: ValidationError[] = [];
        if (_.isBoolean(contact.primary) === false) {
            errors.push(new ValidationError(prefix + ".primary", "primary is not boolean", ""));
        }
        if (isBlankString(contact.type)) {
            errors.push(new ValidationError(prefix + ".type", "type is empty", ""));
        }
        return errors;
    }

    private static _log = logger.getLogger("ContactValidator");
}
