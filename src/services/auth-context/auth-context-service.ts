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
		this._log.debug("finding all auth contexts");
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
		this._log.debug("finding auth contexts by ids %j", ids);
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
		this._log.debug("finding auth context by name %j", authContextName);
		return this.authContextDao.findOneByName(authContextName).then((authContextStored: any) => {
			const authContext: JanuxAuthorize.AuthorizationContext = authContextStored;
			if (_.isNil(authContext)) {
				this._log.warn("failed to find auth context by name %j: not found", authContextName);
				return Promise.reject("No authContext with the authContextname " + authContextName);
			}
			authContext.id = authContextStored.id;
			return Promise.resolve(authContext);
		});
	}

	/**
	 * Find one authorization context by its id.
	 * @param id The id
	 * @return {Promise<any>}
	 */
	public findOneById(id: any): Promise<any> {
		this._log.debug("finding auth context by id %j", id);
		return this.authContextDao.findOne(id).then((authContext: JanuxAuthorize.AuthorizationContext) => {
			if (_.isNil(authContext)) {
				this._log.warn("failed to find auth context by id %j: not found", id);
				return Promise.reject("No authContext with the id " + id);
			}
			return Promise.resolve(authContext);
		});
	}

	/**
	 * Insert a new authorization context
	 * @param object The authContext info to insert.
	 * @return {Promise<any>}
	 */
	public insert(object: any): Promise<any> {
		this._log.debug("inserting auth context %j", object);
		const authContext: JanuxAuthorize.AuthorizationContext = JanuxAuthorize.AuthorizationContext.fromJSON(object);
		authContext.id = object.id;

		// Validate authContext
		const errors = AuthContextValidator.validateAuthContext(authContext);
		if (errors.length > 0) {
			this._log.warn("failed to insert auth context %j: validation errors %j", object, errors);
			return Promise.reject(errors);
		}

		return this.authContextDao.insert(authContext);
	}

	/**
	 * Update the authorization context data
	 * @param object The authContext to be updated.
	 */
	public update(object: any): Promise<any> {
		this._log.debug("updating auth context %j", object);

		let authContext: JanuxAuthorize.AuthorizationContext;
		// Find the authContext
		return this.authContextDao
			.findOne(object.id)
			.then(resultQuery => {
				if (resultQuery === null) {
					this._log.warn("failed to update auth context %j: not found", object);
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
		this._log.debug("updating sort order for %j auth contexts", object.length);

		const promises = Promise.map(object, (authToUpdate: any) => {
			let authContext: JanuxAuthorize.AuthorizationContext;
			// Find the authContext
			return this.authContextDao.findOneByName(authToUpdate.name).then(resultQuery => {
				if (resultQuery === null) {
					this._log.warn("failed to update sort order for %j: not found", authToUpdate.name);
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

		return Promise.all(promises).then((updated: any[]) => {
			this._log.info("updated sort order for %j auth contexts", updated.length);
			return updated;
		});
	}

	/**
	 * Delete an authorization context by its id
	 * @param authContextId The authContext id.
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteById(authContextId: string): Promise<any> {
		this._log.debug("deleting auth context by id %j", authContextId);

		return this.authContextDao.findOne(authContextId).then((resultQuery: JanuxAuthorize.AuthorizationContext) => {
			if (_.isNil(resultQuery)) {
				this._log.warn("failed to delete auth context by id %j: not found", authContextId);
				return Promise.reject("No authContext with the id " + authContextId);
			}
			return this.authContextDao.remove(resultQuery).then((result: any) => {
				this._log.info("deleted auth context -> id %j", authContextId);
				return result;
			});
		});
	}

	/**
	 * Delete an authorization context by its name
	 * @param authContextName The authContext name
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteByName(authContextName: string): Promise<any> {
		this._log.debug("deleting auth context by name %j", authContextName);

		return this.authContextDao
			.findOneByName(authContextName)
			.then((resultQuery: JanuxAuthorize.AuthorizationContext) => {
				if (_.isNil(resultQuery)) {
					this._log.warn("failed to delete auth context by name %j: not found", authContextName);
					return Promise.reject("No authContext with the authContextname " + authContextName);
				}
				return this.authContextDao.remove(resultQuery).then((result: any) => {
					this._log.info("deleted auth context -> name %j", authContextName);
					return result;
				});
			});
	}

	/**
	 * Save or update an authorization context
	 * @param object
	 * @return {Promise<any>}
	 */
	public saveOrUpdate(object: any): Promise<any> {
		this._log.debug("saveOrUpdate choosing insert or update for auth context %j", object);
		if (isBlankString(object.id)) {
			return this.insert(object);
		} else {
			return this.update(object);
		}
	}
}
