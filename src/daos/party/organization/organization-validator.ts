/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import JanuxPeople = require("janux-people");
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import * as logger from 'utils/logger-api/logger-api';
import {isBlankString} from "utils/string/blank-string-validator";

/**
 * Validates the values of the organization.
 */
export class OrganizationValidator {

	public static readonly NAME = "name";
	public static readonly NAME_DUPLICATED = "There is another organization with the same name";
	public static readonly NAME_EMPTY = "Organization name is empty";
	public static readonly IS_SUPPLIER: string = "isSupplier";
	public static readonly MUST_BE_BOOLEAN: string = "Value must be boolean";
	public static readonly IS_RESELLER: string = "isReseller";
	public static readonly FUNCTIONS_PROVIDED: string = "functionsProvided";
	static NOT_ARRAY: string = "Value is not an array";
	static ELEMENT_NOT_STRING: string = "At leas one elements is not a string";

	/**
	 * Validate if the organization values is valid.
	 * @param organization The organization to validate.
	 * @return {ValidationErrorImpl[]}
	 */
	public static validateOrganization(organization: JanuxPeople.Organization): ValidationErrorImpl[] {
		this._log.debug("Call to validateOrganization with organization: %j", organization);
		const errors: ValidationErrorImpl[] = [];
		if (isBlankString(organization.name)) {
			errors.push(new ValidationErrorImpl(this.NAME, this.NAME_EMPTY, ""));
		}
		this._log.debug("Returning errors: %j", errors);
		return errors;
	}

	private static _log = logger.getLogger("OrganizationValidator");
}
