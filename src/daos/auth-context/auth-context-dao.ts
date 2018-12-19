/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-06.
 */

import * as Promise from "bluebird";
import JanuxAuthorize = require("janux-authorize");
import { DbAdapter } from "persistence/api/db-adapters/db-adapter";
import { AbstractDataAccessObjectWithAdapter } from "persistence/implementations/dao/abstract-data-access-object-with-adapter";
import { EntityPropertiesImpl } from "persistence/implementations/dao/entity-properties";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import * as logger from "utils/logger-api/logger-api";
import { AuthContextValidator } from "./auth-context-validator";

/**
 * This is the base class of the partyDao. In this class we define the object we are going to use
 *  is JanuxPeople.Person or JanuxPeople.Organization.
 */
export abstract class AuthContextDao extends AbstractDataAccessObjectWithAdapter<
	JanuxAuthorize.AuthorizationContext,
	string
> {
	private authContextDaoLogger = logger.getLogger("authContextDao");

	constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	/**
	 * Find one record that matches with the name
	 * @param name The name to look for.
	 * @return A list of parties that matches with the name.
	 */
	public findOneByName(name: string): Promise<JanuxAuthorize.AuthorizationContext[]> {
		return this.findOneByAttribute("name", name);
	}

	/**
	 * Implementation of the method validateEntity.
	 * @param objectToValidate The object to validate.
	 * @return {ValidationErrorImpl[]} An array containing the validation errors. If there are no errors then
	 * returns an empty array.
	 */
	protected validateEntity<t>(objectToValidate: JanuxAuthorize.AuthorizationContext): ValidationErrorImpl[] {
		return AuthContextValidator.validateAuthContext(objectToValidate);
	}

	/**
	 * Validate the object before insertMethod it to the database.
	 * Given the validation might involve complex queries. The method is marked as abstract in order to be
	 * implemented by each extended class.
	 * @param objectToInsert The object to validate.
	 */
	protected abstract validateBeforeInsert(
		objectToInsert: JanuxAuthorize.AuthorizationContext
	): Promise<ValidationErrorImpl[]>;

	/**
	 * Transforms the object before inserting or updating the database.
	 * In this case JanuxAuthorize.AuthorizationContext has a method called toJSON.
	 * We are going to use this method.
	 * @param object The object to transforms.
	 * @return {any} the transformed object.
	 */
	protected convertBeforeSave(object: JanuxAuthorize.AuthorizationContext): any {
		this.authContextDaoLogger.debug("Call to convertBeforeSave with object: %j ", object);
		let result: any = object.toJSON();

		// TODO: JanuxAuthorize.AuthorizationContext has circular references?
		result = JSON.parse(JSON.stringify(result));
		result.typeName = object.typeName;
		this.authContextDaoLogger.debug("Returning %j", result);
		return result;
	}

	/**
	 * Convert the object to a janux authorization context
	 * @param object The data retrieved form the database.
	 * @return {any} Ans instance of JanuxAuthorize.AuthorizationContext
	 */
	protected convertAfterDbOperation(object: any): JanuxAuthorize.AuthorizationContext {
		let result: any;
		result = JanuxAuthorize.AuthorizationContext.fromJSON(object);
		result.id = object.id;
		return result;
	}
}
