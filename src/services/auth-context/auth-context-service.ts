/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */

import * as Promise from "bluebird";
import { AuthContextDao } from "daos/auth-context/auth-context-dao";
import { AuthContextValidator } from "daos/auth-context/auth-context-validator";
import JanuxAuthorize = require("janux-authorize");
import * as _ from "lodash";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import * as logger from "utils/logger-api/logger-api";
import { isBlankString } from "utils/string/blank-string-validator";

/**
 * This class has basic authContext service methods.
 */
export class AuthContextService {
	public static createInstance(authContextDao: AuthContextDao) {
		return this._instance || (this._instance = new this(authContextDao));
	}

	private static _instance: AuthContextService;
	public AUTHCONTEXT = "Authorization Context";
	public AUTHCONTEXT_NOT_IN_DATABASE = "The authorization context with this id does not exist in the database";
	private _log = logger.getLogger("AuthContextService");
	private authContextDao: AuthContextDao;

	private constructor(authContextDao: AuthContextDao) {
		this.authContextDao = authContextDao;
	}

	/**
	 * Find all authorization contexts
	 * @return {Promise<U>}
	 */
	public findAll(): Promise<any[]> {
		this._log.debug("Call to findAll Method");
		return this.authContextDao.findAll().then((authContexts: JanuxAuthorize.AuthorizationContext[]) => {
			return authContexts;
		});
	}

	/**
	 * Find all authorization contexts whose ids belongs to the list.
	 * @param arrayOfIds The ids to look for.
	 * @return {Promise<any[]>} A promise containing the authorization contexts.
	 * If no records are founded, then the method returns an empty array.
	 */
	public findByIdsIn(ids: string[]): Promise<any[]> {
		this._log.debug("Call to findByIdsIn with ids %j", ids);
		return this.authContextDao.findByIds(ids).then((authContexts: JanuxAuthorize.AuthorizationContext[]) => {
			return authContexts;
		});
	}

	/**
	 * Find one authorization context by its name.
	 * @param authContextname
	 * @return {Promise<any>}
	 */
	public findOneByName(authContextName: string): Promise<any> {
		this._log.debug("Call to findOneByName with authContextName: %j", authContextName);
		let result: any;
		return this.authContextDao.findOneByName(authContextName).then((authContextStored: any) => {
			const authContext: JanuxAuthorize.AuthorizationContext = authContextStored;
			authContext.id = authContextStored.id;
			if (_.isNil(authContext))
				return Promise.reject("No authContext with the authContextname " + authContextName);
			result = authContext;
			this._log.debug("Returning %j", result);
			return Promise.resolve(result);
		});
	}

	/**
	 * Find one authorization context by its id.
	 * @param id The id
	 * @return {Promise<any>}
	 */
	public findOneById(id: any): Promise<any> {
		this._log.debug("Call to findOneByUserId with id: %j", id);
		let result: any;
		return this.authContextDao.findOne(id).then((authContext: JanuxAuthorize.AuthorizationContext) => {
			if (_.isNil(authContext)) return Promise.reject("No authContext with the id " + id);
			result = authContext;
			this._log.debug("Returning %j", result);
			return Promise.resolve(result);
		});
	}

	/**
	 * Insert a new authorization context
	 * @param object The authContext info to insert.
	 * @return {Promise<any>}
	 */
	public insert(object: any): Promise<any> {
		this._log.debug("Call to insertMethod with object %j", object);
		const authContext: JanuxAuthorize.AuthorizationContext = JanuxAuthorize.AuthorizationContext.fromJSON(object);
		authContext.id = object.id;

		// Validate authContext
		const errors = AuthContextValidator.validateAuthContext(authContext);
		if (errors.length > 0) {
			return Promise.reject(errors);
		}

		return this.authContextDao.insert(authContext);
	}

	/**
	 * Update the authorization context data
	 * @param object The authContext to be updated.
	 */
	public update(object: any): Promise<any> {
		this._log.debug("Call to updateMethod with object:%j", object);

		let authContext: JanuxAuthorize.AuthorizationContext;
		// Find the authContext
		return this.authContextDao
			.findOne(object.id)
			.then(resultQuery => {
				if (resultQuery === null) {
					return Promise.reject([
						new ValidationErrorImpl(this.AUTHCONTEXT, this.AUTHCONTEXT_NOT_IN_DATABASE, object.id)
					]);
				} else {
					authContext = JanuxAuthorize.AuthorizationContext.fromJSON(object);
					authContext.id = object.id;

					return this.authContextDao.update(authContext);
				}
			})
			.then((updatedAuthContext: JanuxAuthorize.AuthorizationContext) => {
				return Promise.resolve(updatedAuthContext);
			});
	}

	/**
	 * Update order of the authorization context
	 * @param object The authContext name and sort order to be updated.
	 */
	public updateSortOrder(object: any): Promise<any> {
		this._log.debug("Call to updateSortOrder with object:%j", object);

		const promises = Promise.map(object, (authToUpdate: any) => {
			let authContext: JanuxAuthorize.AuthorizationContext;
			// Find the authContext
			return this.authContextDao.findOneByName(authToUpdate.name).then(resultQuery => {
				if (resultQuery === null) {
					return Promise.reject([
						new ValidationErrorImpl(this.AUTHCONTEXT, this.AUTHCONTEXT_NOT_IN_DATABASE, object.id)
					]);
				} else {
					const authObject: any = _.find(object, {
						name: authToUpdate.name
					});

					authContext = resultQuery;
					authContext.sortOrder = authObject.sortOrder;
					return this.authContextDao.update(resultQuery);
				}
			});
		});

		return Promise.all(promises);
	}

	/**
	 * Delete an authorization context by its id
	 * @param authContextId The authContext id.
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteById(authContextId: string): Promise<any> {
		this._log.debug("Call to deleteById with authContextId: %j", authContextId);

		return this.authContextDao.findOne(authContextId).then((resultQuery: JanuxAuthorize.AuthorizationContext) => {
			return this.authContextDao.remove(resultQuery);
		});
	}

	/**
	 * Delete an authorization context by its name
	 * @param authContextName The authContext name
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteByName(authContextName: string): Promise<any> {
		this._log.debug("Call to deleteById with authContextName: %j", authContextName);

		return this.authContextDao
			.findOneByName(authContextName)
			.then((resultQuery: JanuxAuthorize.AuthorizationContext) => {
				return this.authContextDao.remove(resultQuery);
			});
	}

	/**
	 * Save or update an authorization context
	 * @param object
	 * @return {Promise<any>}
	 */
	public saveOrUpdate(object: any): Promise<any> {
		this._log.debug("Call to saveOrUpdate with object: %j", object);
		if (isBlankString(object.id)) {
			return this.insert(object);
		} else {
			return this.update(object);
		}
	}
}
