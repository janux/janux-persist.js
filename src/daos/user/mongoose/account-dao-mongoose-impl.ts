/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import Promise = require("bluebird");
import { EntityPropertiesImpl } from "persistence/implementations/dao/entity-properties";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import { MongooseAdapter } from "persistence/implementations/db-adapters/mongoose-db-adapter";
import { isBlankString } from "utils/string/blank-string-validator";
import { AccountDao } from "../account-dao";
import { AccountEntity } from "../account-entity";
import { AccountValidator } from "../account-validator";

/**
 * AccountDao implementation for the mongoose library.
 */
export class AccountDaoMongooseImpl extends AccountDao {
	constructor(dbEngineUtil: MongooseAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbEngineUtil, entityProperties);
	}

	/**
	 * Find all the users whose user name matches.
	 * @param username The username to match.
	 * @return {Promise<AccountEntity[]>} The parties whose username matches. If no record is founded then the method
	 * returns an empty array.
	 */
	public findByUserNameMatch(username: string): Promise<AccountEntity[]> {
		const regexpUsername = new RegExp(username, "i");
		const query = {
			username: regexpUsername
		};
		return this.findByQuery(query);
	}

	/**
	 * Find all the users whose date or update period matches.
	 * @param period The period to match.
	 * @return {Promise<AccountEntity[]>} The users whose period matches. If no record is founded then the method
	 * returns an empty array.
	 */
	public findUserByPeriod(period: any): Promise<AccountEntity[]> {
		const query = {
			$and: [
				{
					$or: [
						{
							dateCreated: {
								$gte: new Date(period.from),
								$lte: new Date(period.to)
							}
						},
						{
							lastUpdate: {
								$gte: new Date(period.from),
								$lte: new Date(period.to)
							}
						}
					]
				}
			]
		  };
		return this.findByQuery(query);
	}

	/**
	 * Validate the object before inserting to the database.
	 * In this case the method validates for duplicated usernames.
	 * @param objectToInsert The object to validate.
	 * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
	 */
	protected validateBeforeInsert(objectToInsert: AccountEntity): Promise<ValidationErrorImpl[]> {
		if (isBlankString(objectToInsert.password)) {
			return Promise.resolve([
				new ValidationErrorImpl(AccountValidator.PASSWORD, AccountValidator.PASSWORD_EMPTY, "")
			]);
		}
		const query = {
			$or: [{ username: { $eq: objectToInsert.username } }, { contactId: { $eq: objectToInsert.contactId } }]
		};
		return this.findByQuery(query).then(result => {
			return Promise.resolve(AccountValidator.validateResultQueryBeforeBdOperation(result, objectToInsert));
		});
	}

	/**
	 * Validate the object before updating to the database.
	 * In this case the method validates for duplicated usernames.
	 * @param objectToUpdate The object to updateMethod.
	 * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
	 */
	protected validateBeforeUpdate(objectToUpdate: AccountEntity): Promise<ValidationErrorImpl[]> {
		const query = {
			$and: [
				{ id: { $ne: objectToUpdate.id } },
				{
					$or: [
						{ username: { $eq: objectToUpdate.username } },
						{ contactId: { $eq: objectToUpdate.contactId } }
					]
				}
			]
		};
		return this.findByQuery(query).then((result: AccountEntity[]) => {
			return Promise.resolve(AccountValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
		});
	}
}
