/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */

import JanuxAuthorize = require("janux-authorize");
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import * as logger from "../../util/logger-api/logger-api";

/**
 * Validates if the authContext has the correct values.
 */
export class AuthContextValidator {

	public static readonly AUTH_CONTEXT_TYPE: string = "janux.security.AuthorizationContext";
	public static readonly TYPE: string = "type";
	public static readonly TYPE_EMPTY = "Type is empty";
	public static TYPE_NOT_AUTH_CONTEXT = "The type does not correspond to an authorization context";
	public static ANOTHER_NAME: string = "There is another authorization context with the same name";

	/**
	 * Validate the structure of the authorization context and its type
	 * @param authContext
	 * @return {ValidationErrorImpl[]} A list of errors. If the record is valid. The the method returns an empty array.
	 */
	public static validateAuthContext(authContext: JanuxAuthorize.AuthorizationContext): ValidationErrorImpl[] {
		this._log.debug("Call to validateAuthContext with authContext: %j", authContext);
		const errors: ValidationErrorImpl[] = [];
		if (isBlankString(authContext.typeName)) {
			errors.push(new ValidationErrorImpl(this.TYPE, this.TYPE_EMPTY, ""));
		} else if (authContext.typeName !== this.AUTH_CONTEXT_TYPE) {
			errors.push(new ValidationErrorImpl(
				this.TYPE,
				this.TYPE_NOT_AUTH_CONTEXT,
				""));
		}

		this._log.debug("Returning: %j", errors);
		return errors;
	}

	/**
	 * Validate the cause of the duplicated authorization context name
	 * @param authContexts
	 * @param reference
	 * @return {ValidationErrorImpl[]}
	 */
	public static validateResultQueryBeforeBdOperation(authContexts: JanuxAuthorize.AuthorizationContext[], reference: JanuxAuthorize.AuthorizationContext): ValidationErrorImpl[] {
		this._log.debug("Call to validateResultQueryBeforeBdOperation with accounts: %j reference: %j",
			authContexts, reference);
		const errors: ValidationErrorImpl[] = [];
		if (authContexts.length > 0) {
			if (authContexts[0].name === reference.name) {
				errors.push(
					new ValidationErrorImpl(
						"name",
						this.ANOTHER_NAME,
						reference.name));
			}
		}
		this._log.debug("Returning %j", errors);
		return errors;
	}

	private static _log = logger.getLogger("AuthContextValidator");
}
