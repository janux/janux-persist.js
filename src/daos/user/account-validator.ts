/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import * as logger from 'utils/logger-api/logger-api';
import {isBlankString} from "utils/string/blank-string-validator";
import {AccountEntity} from "./account-entity";

/**
 * Class that contains the validation methods for the userEntity.
 */
export class AccountValidator {

	public static ANOTHER_USER: string = "There is another account with the same username";
	public static ANOTHER_CONTACT: string = "There is another account with the same contactId";

	/**
	 * Validate the accountEntity
	 * @param accountEntity AccountEntity to be validated
	 * @return {ValidationErrorImpl[]} A list of validation errors.
	 */
	public static validateAccount(accountEntity: AccountEntity): ValidationErrorImpl[] {
		this._log.debug("Call to validateAccount with accountEntity: %j:", accountEntity);
		let errors: ValidationErrorImpl[] = [];
		errors = errors.concat(this.validateAccountExceptContactId(accountEntity));
		if (isBlankString(accountEntity.contactId)) {
			errors.push(new ValidationErrorImpl("contact", "Contact id is empty", ""));
		}
		this._log.debug("Errors: %j", errors);
		return errors;
	}

	/**
	 * Same as validateAccount, but this method doesn't validate if the "contactId" attribute is empty.
	 * @param accountEntity
	 * @return {ValidationErrorImpl[]} A list of validation errors.
	 */
	public static validateAccountExceptContactId(accountEntity: AccountEntity): ValidationErrorImpl[] {
		this._log.debug("Call to validateAccountExceptContactId with accountEntity: %j:", accountEntity);
		const errors: ValidationErrorImpl[] = [];
		if (isBlankString(accountEntity.username)) {
			errors.push(new ValidationErrorImpl("username", "Username is empty", accountEntity.username));
		}
		if (isBlankString(accountEntity.password)) {
			errors.push(new ValidationErrorImpl("password", "Password is empty", accountEntity.password));
		}

		this._log.debug("Errors: %j", errors);
		return errors;
	}

	/**
	 * Validate the cause of the duplicated record. Could be a duplicated username or a duplicated
	 * contactId.
	 * @param accounts
	 * @param reference
	 * @return {ValidationErrorImpl[]}
	 */
	public static validateResultQueryBeforeBdOperation(accounts: AccountEntity[], reference: AccountEntity): ValidationErrorImpl[] {
		this._log.debug("Call to validateResultQueryBeforeBdOperation with accounts: %j reference: %j",
			accounts, reference);
		const errors: ValidationErrorImpl[] = [];
		if (accounts.length > 0) {
			if (accounts[0].username === reference.username) {
				errors.push(
					new ValidationErrorImpl(
						"username",
						this.ANOTHER_USER,
						reference.username));
			} else {
				errors.push(
					new ValidationErrorImpl(
						"contactId",
						this.ANOTHER_CONTACT,
						reference.username));
			}
		}
		this._log.debug("Returning %j", errors);
		return errors;
	}

	private static _log = logger.getLogger("AccountValidator");
}
