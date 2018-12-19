/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */

import JanuxAuthorize = require("janux-authorize");
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import * as logger from "utils/logger-api/logger-api";
import { isBlankString } from "utils/string/blank-string-validator";

/**
 * Validates if the role has the correct values.
 */
export class RoleValidator {
	public static readonly ROLE_TYPE: string = "janux.security.Role";
	public static readonly TYPE: string = "type";
	public static readonly TYPE_EMPTY = "Type is empty";
	public static TYPE_NOT_ROLE = "The type does not correspond to a role";
	public static ANOTHER_NAME: string = "There is another role with the same name";

	/**
	 * Validate the structure of the role and its type
	 * @param role
	 * @return {ValidationErrorImpl[]} A list of errors. If the record is valid. The the method returns an empty array.
	 */
	public static validateRole(role: JanuxAuthorize.Role): ValidationErrorImpl[] {
		this._log.debug("Call to validateRole with role: %j", role);
		const errors: ValidationErrorImpl[] = [];
		if (isBlankString(role.typeName)) {
			errors.push(new ValidationErrorImpl(this.TYPE, this.TYPE_EMPTY, ""));
		} else if (role.typeName !== this.ROLE_TYPE) {
			errors.push(new ValidationErrorImpl(this.TYPE, this.TYPE_NOT_ROLE, ""));
		}

		this._log.debug("Returning: %j", errors);
		return errors;
	}

	/**
	 * Validate the cause of the duplicated role name
	 * @param roles
	 * @param reference
	 * @return {ValidationErrorImpl[]}
	 */
	public static validateResultQueryBeforeBdOperation(
		roles: JanuxAuthorize.Role[],
		reference: JanuxAuthorize.Role
	): ValidationErrorImpl[] {
		this._log.debug("Call to validateResultQueryBeforeBdOperation with roles: %j reference: %j", roles, reference);
		const errors: ValidationErrorImpl[] = [];
		if (roles.length > 0) {
			if (roles[0].name === reference.name) {
				errors.push(new ValidationErrorImpl("name", this.ANOTHER_NAME, reference.name));
			}
		}
		this._log.debug("Returning %j", errors);
		return errors;
	}

	private static _log = logger.getLogger("RoleValidator");
}
