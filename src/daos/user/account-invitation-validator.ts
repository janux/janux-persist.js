/**
 * Project janux-persistence
 * Created by hielo on 2018-08-18.
 */

import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import * as logger from 'utils/logger-api/logger-api';
import {isBlankString} from "utils/string/blank-string-validator";
import {AccountInvitationEntity} from "./account-invitation-entity";

/**
 * Class that contains the validation methods for the accountInvitationEntity.
 */
export class AccountInvitationValidator {

	public static CODE: string = 'Code';
	public static CODE_EMPTY: string = 'Code is empty';
	public static TYPE: string = 'Type';
	public static TYPE_EMPTY: string = 'Type is empty';
	public static ANOTHER_INVITATION: string = "There is another account invitation for the same accountInvitation";
	public static ANOTHER_CODE: string = "There is another invitation with the same code";

	/**
	 * Validate the accountInvitationEntity
	 * @param accountInvitationEntity AccountInvitationEntity to be validated
	 * @return {ValidationErrorImpl[]} A list of validation errors.
	 */
	public static validateAccountInvitation(accountInvitationEntity: AccountInvitationEntity): ValidationErrorImpl[] {
		this._log.debug("Call to validateAccountInvitation with accountInvitationInvitationEntity: %j:", accountInvitationEntity);
		const errors: ValidationErrorImpl[] = [];
		if (isBlankString(accountInvitationEntity.accountId)) {
			errors.push(new ValidationErrorImpl("account", "Account id is empty", ""));
		}
		this._log.debug("Errors: %j", errors);
		return errors;
	}

	/**
	 * Validate the cause of the duplicated record. Could be a duplicated accountId or a duplicated
	 * code.
	 * @param accountInvitations
	 * @param reference
	 * @return {ValidationErrorImpl[]}
	 */
	public static validateResultQueryBeforeBdOperation(accountInvitations: AccountInvitationEntity[], reference: AccountInvitationEntity): ValidationErrorImpl[] {
		this._log.debug("Call to validateResultQueryBeforeBdOperation with accountInvitations: %j reference: %j",
			accountInvitations, reference);
		const errors: ValidationErrorImpl[] = [];
		if (accountInvitations.length > 0) {
			if (accountInvitations[0].code === reference.code) {
				errors.push(
					new ValidationErrorImpl(
						"code",
						this.ANOTHER_CODE,
						reference.accountId));
			}
		}
		this._log.debug("Returning %j", errors);
		return errors;
	}

	private static _log = logger.getLogger("AccountInvitationValidator");
}
