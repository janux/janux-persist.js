/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import Promise = require("bluebird");
import {DbAdapter} from "persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {AccountEntity} from "./account-entity";
import {AccountValidator} from "./account-validator";

/**
 * User dao.
 */
export abstract class AccountDao extends AbstractDataAccessObjectWithAdapter<AccountEntity, string> {

	constructor(dbEngineUtil: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbEngineUtil, entityProperties);
	}

	/**
	 * Find all the users whose user name matches.
	 * This is an abstract class because the query is implement in a different way for lokijs and
	 * mongoose.
	 * @param username The username to match.
	 */
	public abstract findByUserNameMatch(username: string): Promise<AccountEntity[]>;

	/**
	 * Find one user with the username.
	 * @param username the username to look for.
	 * @return {Promise<AccountEntity>} The user, if no record is founded then it return a null.
	 */
	public findOneByUserName(username: string): Promise<AccountEntity> {
		return this.findOneByAttribute("username", username);
	}

	/**
	 * Find one user whose attribute "userId" matches with the value.
	 * @param userId The value to look for.
	 * @return {Promise<AccountEntity>} The user, if no record is founded then it return a null.
	 */
	public findOneByUserId(userId: string): Promise<AccountEntity> {
		return this.findOneByAttribute("userId", userId);
	}

	/**
	 * Find one user whose attribute "contactId" matches with the value.
	 * @param contactId The value to look for.
	 * @return {Promise<AccountEntity>} The user, if no record is founded then it return a null.
	 */
	public findOneByContactId(contactId: string) {
		return this.findOneByAttribute("contactId", contactId);
	}

	/**
	 * Find all users whose "contactId" attribute matches with the values.
	 * @param contactIds The values to look for.
	 * @return {Promise<AccountEntity[]>} The users, if no record is founded then it return an empty array.
	 */
	public findByContactIdsIn(contactIds: any[]): Promise<AccountEntity[]> {
		return this.findByAttributeNameIn("contactId", contactIds);
	}

	/**
	 * Validate the entity before insertMethod or updateMethod.
	 * @param objectToValidate The object to validate.
	 * @return {ValidationErrorImpl[]} An array containing the validation errors. If there are no errors then
	 * returns an empty array
	 */
	protected validateEntity(objectToValidate: AccountEntity): ValidationErrorImpl[] {
		return AccountValidator.validateAccount(objectToValidate);
	}

	/**
	 * Validate the object before insertMethod it to the database.
	 * Given the validation might involve complex queries. The method is marked as abstract in order to be
	 * implemented by each extended class.
	 * @param objectToInsert The object to validate.
	 */
	protected abstract validateBeforeInsert(objectToInsert: AccountEntity): Promise<ValidationErrorImpl[]>;

	/**
	 * Validate the object before updateMethod it to the database.
	 * Given the validation might involve complex queries. The method is marked as abstract in order to be
	 * implemented by each extended class.
	 * @param objectToUpdate
	 */
	protected abstract validateBeforeUpdate(objectToUpdate: AccountEntity): Promise<ValidationErrorImpl[]>;

}
