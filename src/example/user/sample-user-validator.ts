/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as EmailValidator from "email-validator";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import * as logger from "utils/logger-api/logger-api";
import { isBlankString } from "utils/string/blank-string-validator";
import { SampleUser } from "./sample-user";

/**
 * Validate the entity
 * @param exampleUser The object to be validated
 * @return {ValidationErrorImpl[]} A list of errors founded.
 */
export function validateExampleUser(exampleUser: SampleUser): ValidationErrorImpl[] {
	const log = logger.getLogger("validateExampleUser");
	const errors: ValidationErrorImpl[] = [];
	log.debug("Call to validateExampleUser with exampleUser:%j", exampleUser);
	// Validating name not empty
	if (isBlankString(exampleUser.name)) {
		errors.push(new ValidationErrorImpl("name", "Empty name", exampleUser.name));
	}

	// Validating email not empty
	if (isBlankString(exampleUser.email)) {
		errors.push(new ValidationErrorImpl("email", "Empty email", exampleUser.email));
	} else {
		// Validating email is valid
		if (!EmailValidator.validate(exampleUser.email)) {
			errors.push(new ValidationErrorImpl("email", "Email is not a valid address", exampleUser.email));
		}
	}
	log.debug("Returning errors: %j", errors);
	return errors;
}
