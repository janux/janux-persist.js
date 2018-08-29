/**
 * Project janux-persistence
 * Created by hielo on 2018-08-18.
 */

import Promise = require("bluebird");
import {DbAdapter} from "persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {AccountInvitationEntity} from "./account-invitation-entity";
import {AccountInvitationValidator} from "./account-invitation-validator";

/**
 * Account invitation dao.
 */
export abstract class AccountInvitationDao extends AbstractDataAccessObjectWithAdapter<AccountInvitationEntity, string> {

	constructor(dbEngineUtil: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbEngineUtil, entityProperties);
	}

	/**
	 * Find one invitation with the code provided.
	 * @param code the code to look for.
	 * @return {Promise<AccountInvitationEntity>} The invitation, if no record is founded then it return a null.
	 */
	public findOneByCode(code: string): Promise<AccountInvitationEntity> {
		return this.findOneByAttribute("code", code);
	}

	/**
	 * Find one invitation whose attribute "accountId" matches with the value.
	 * @param accountId The value to look for.
	 * @return {Promise<AccountInvitationEntity>} The user, if no record is founded then it return a null.
	 */
	public findOneByAccountId(accountId: string): Promise<AccountInvitationEntity> {
		return this.findOneByAttribute("accountId", accountId);
	}

	/**
	 * Find all users whose "accountId" attribute matches with the values.
	 * @param accountIds The values to look for.
	 * @return {Promise<AccountEntity[]>} The invitations, if no record is founded then it return an empty array.
	 */
	public findByAccountIdsIn(accountIds: any[]): Promise<AccountInvitationEntity[]> {
		return this.findByAttributeNameIn("accountId", accountIds);
	}

	/**
	 * Validate the entity before insertMethod or updateMethod.
	 * @param objectToValidate The object to validate.
	 * @return {ValidationErrorImpl[]} An array containing the validation errors. If there are no errors then
	 * returns an empty array
	 */
	protected validateEntity(objectToValidate: AccountInvitationEntity): ValidationErrorImpl[] {
		return AccountInvitationValidator.validateAccountInvitation(objectToValidate);
	}

	/**
	 * Validate the object before insertMethod it to the database.
	 * Given the validation might involve complex queries. The method is marked as abstract in order to be
	 * implemented by each extended class.
	 * @param objectToInsert The object to validate.
	 */
	protected abstract validateBeforeInsert(objectToInsert: AccountInvitationEntity): Promise<ValidationErrorImpl[]>;

	/**
	 * Validate the object before updateMethod it to the database.
	 * Given the validation might involve complex queries. The method is marked as abstract in order to be
	 * implemented by each extended class.
	 * @param objectToUpdate
	 */
	protected abstract validateBeforeUpdate(objectToUpdate: AccountInvitationEntity): Promise<ValidationErrorImpl[]>;

}
