/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */
import * as emailValidator from 'email-validator';
import * as JanuxPeople from "janux-people.js";
import {ValidationError} from "../../../../persistence/impl/validation-error";
import {isBlankString} from "../../../../util/blank-string-validator";
import {LoggerFactory} from "../../../../util/logger-factory/logger_factory";

export class EmailValidator {

    public static readonly EMAIL_ADDRESS = "contacts.emails.address";
    public static readonly EMAIL_EMPTY = "Email address is empty";
    public static readonly EMAIL_INVALID = "This address is not a valid email address";

    public static validateEmail(email: JanuxPeople.EmailAddress): ValidationError[] {
        this._log.debug("Call to validateEmail with email: %j", email);
        const errors: ValidationError[] = [];
        if (isBlankString(email.address)) {
            errors.push(new ValidationError(this.EMAIL_ADDRESS, this.EMAIL_EMPTY, ""));
        } else if (emailValidator.validate(email.address) === false) {
            errors.push(new ValidationError(
                this.EMAIL_ADDRESS,
                this.EMAIL_INVALID,
                email.address));
        }
        this._log.debug("Returning %j", errors);
        return errors;
    }

    private static _log = LoggerFactory.getLogger("EmailValidator");
}
