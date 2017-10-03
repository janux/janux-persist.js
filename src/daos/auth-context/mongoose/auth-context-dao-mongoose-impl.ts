/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */

import Promise = require("bluebird");
import JanuxAuthorize = require("janux-authorize");
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {MongooseAdapter} from "persistence/implementations/db-adapters/mongoose-db-adapter";
import {AuthContextDao} from "../auth-context-dao";
import {AuthContextValidator} from "../auth-context-validator";

/**
 * AuthContextDao implementation for the mongoose library.
 */
export class AuthContextDaoMongooseImpl extends AuthContextDao {

	constructor(dbEngineUtil: MongooseAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbEngineUtil, entityProperties);
	}

	/**
	 * Validate the object before inserting to the database.
	 * In this case the method validates for duplicated authorization context names.
	 * @param objectToInsert The object to validate.
	 * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
	 */
	protected validateBeforeInsert(objectToInsert: JanuxAuthorize.AuthorizationContext): Promise<ValidationErrorImpl[]> {
		const query = {
			$or: [
				{name: {$eq: objectToInsert.name}}
			]
		};
		return this.findByQuery(query)
			.then((result) => {
				return Promise.resolve(AuthContextValidator.validateResultQueryBeforeBdOperation(result, objectToInsert));
			});
	}

	/**
	 * Validate the object before updating to the database.
	 * In this case the method validates for authorization context with same name.
	 * @param objectToUpdate The object to updateMethod.
	 * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
	 */
	protected validateBeforeUpdate(objectToUpdate: JanuxAuthorize.AuthorizationContext): Promise<ValidationErrorImpl[]> {
		const query = {
			$and: [
				{id: {$ne: objectToUpdate.id}},
				{
					$or: [
						{name: {$eq: objectToUpdate.name}}
					]
				}
			]
		};
		return this.findByQuery(query)
			.then((result: JanuxAuthorize.AuthorizationContext[]) => {
				return Promise.resolve(AuthContextValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
			});
	}
}
