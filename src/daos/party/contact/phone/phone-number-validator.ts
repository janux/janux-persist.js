/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import JanuxPeople = require("janux-people");
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import * as logger from "utils/logger-api/logger-api";
import { isBlankString } from "utils/string/blank-string-validator";

export class PhoneNumberValidator {
	public static readonly CONTACT_PHONE = "contacts.phone.number";
	public static readonly NUMBER_EMPTY = "The number is empty";

	public static validatePhoneNumber(phone: JanuxPeople.PhoneNumber): ValidationErrorImpl[] {
		this._log.debug("Call to validatePhoneNumber with phone: %j", phone);
		const errors: ValidationErrorImpl[] = [];
		if (isBlankString(phone.number)) {
			errors.push(new ValidationErrorImpl(this.CONTACT_PHONE, this.NUMBER_EMPTY, ""));
		}
		this._log.debug("Returning %j ", errors);
		return errors;
	}

	private static _log = logger.getLogger("PhoneNumberValidator");
}
