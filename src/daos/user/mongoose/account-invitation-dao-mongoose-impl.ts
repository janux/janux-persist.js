/**
 * Project janux-persistence
 * Created by hielo on 2018-08-17.
 */

import Promise = require("bluebird");
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {MongooseAdapter} from "persistence/implementations/db-adapters/mongoose-db-adapter";
import {isBlankString} from "utils/string/blank-string-validator";
import {AccountInvitationDao} from "../account-invitation-dao";
import {AccountInvitationEntity} from "../account-invitation-entity";
import {AccountInvitationValidator} from "../account-invitation-validator";

/**
 * AccountInvitationDao implementation for the mongoose library.
 */
export class AccountInvitationDaoMongooseImpl extends AccountInvitationDao {

	constructor(dbEngineUtil: MongooseAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbEngineUtil, entityProperties);
	}

	/**
	 * Validate the object before inserting to the database.
	 * In this case the method validates for duplicated account id.
	 * @param objectToInsert The object to validate.
	 * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
	 */
	protected validateBeforeInsert(objectToInsert: AccountInvitationEntity): Promise<ValidationErrorImpl[]> {
		if (isBlankString(objectToInsert.code)) {
			return Promise.resolve([new ValidationErrorImpl(AccountInvitationValidator.CODE, AccountInvitationValidator.CODE_EMPTY, '')]);
		} else if (isBlankString(objectToInsert.type)) {
			return Promise.resolve([new ValidationErrorImpl(AccountInvitationValidator.TYPE, AccountInvitationValidator.TYPE_EMPTY, '')]);
		}

		const query = {
			$or: [
				// {accountId: {$eq: objectToInsert.accountId}},
				{code: {$eq: objectToInsert.code}}
			]
		};
		return this.findByQuery(query)
			.then((result) => {
			return Promise.resolve(AccountInvitationValidator.validateResultQueryBeforeBdOperation(result, objectToInsert));
	});
	}

	/**
	 * Validate the object before updating to the database.
	 * In this case the method validates for duplicated usernames.
	 * @param objectToUpdate The object to updateMethod.
	 * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
	 */
	protected validateBeforeUpdate(objectToUpdate: AccountInvitationEntity): Promise<ValidationErrorImpl[]> {
		const query = {
			$and: [
				{id: {$ne: objectToUpdate.id}},
				{
					$or: [
						// {accountId: {$eq: objectToUpdate.accountId}},
						{code: {$eq: objectToUpdate.code}}
					]
				}
			]
		};
		return this.findByQuery(query)
			.then((result: AccountInvitationEntity[]) => {
			return Promise.resolve(AccountInvitationValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
		});
	}
}
