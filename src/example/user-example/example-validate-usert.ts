/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as EmailValidator from "email-validator";
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {LoggerFactory} from "../../util/log4js/log4js_factory";
import {ExampleUser} from "./example-user";

/**
 * Validate the entity
 * @param exampleUser The object to be validated
 * @return {ValidationError[]} A list of errors founded.
 */
export function validateExampleUser(exampleUser: ExampleUser): ValidationError[] {
    const log = LoggerFactory.getLogger("validateExampleUser");
    const errors: ValidationError[] = [];
    log.debug("Call to validateExampleUser with exampleUser:%j", exampleUser);
    // Validating name not empty
    if (isBlankString(exampleUser.name)) {
        errors.push(new ValidationError("name", "Empty name", exampleUser.name));
    }

    // Validating email not empty
    if (isBlankString(exampleUser.email)) {
        errors.push(new ValidationError("email", "Empty email", exampleUser.email));
    } else {
        // Validating email is valid
        if (!EmailValidator.validate(exampleUser.email)) {
            errors.push(new ValidationError("email", "Email is not a valid address", exampleUser.email));
        }
    }
    log.debug("Returning errors: %j", errors);
    return errors;
}
