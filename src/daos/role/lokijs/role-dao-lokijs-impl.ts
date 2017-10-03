/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-12
 */

import Promise = require("bluebird");
import JanuxAuthorize = require("janux-authorize");
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {LokiJsAdapter} from "persistence/implementations/db-adapters/lokijs-db-adapter";
import {RoleDao} from "../role-dao";
import {RoleValidator} from "../role-validator";

/**
 * RoleDao implementation for mongoose library.
 */
export class RoleDaoLokiJsImpl extends RoleDao {

	constructor(dbAdapter: LokiJsAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	/**
	 * Validate the object before inserting to the database.
	 * In this case the method validates for duplicated Role names.
	 * @param objectToInsert The object to validate.
	 * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
	 */
	protected validateBeforeInsert(objectToInsert: JanuxAuthorize.Role): Promise<ValidationErrorImpl[]> {
		const query = {
			$or: [
				{name: {$eq: objectToInsert.name}}
			]
		};
		return this.findByQuery(query)
			.then((result) => {
				return Promise.resolve(RoleValidator.validateResultQueryBeforeBdOperation(result, objectToInsert));
			});
	}

	/**
	 * Validate the object before updating to the database.
	 * In this case the method validates for Role with same name.
	 * @param objectToUpdate The object to updateMethod.
	 * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
	 */
	protected validateBeforeUpdate(objectToUpdate: JanuxAuthorize.Role): Promise<ValidationErrorImpl[]> {
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
			.then((result: JanuxAuthorize.Role[]) => {
				return Promise.resolve(RoleValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
			});
	}
}
