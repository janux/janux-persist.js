/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-12
 */

import * as Promise from "bluebird";
import {RoleDao} from "daos/role/role-dao";
import {RoleValidator} from "daos/role/role-validator";
import JanuxAuthorize = require("janux-authorize");
import * as _ from 'lodash';
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import * as logger from "utils/logger-api/logger-api";
import {isBlankString} from "utils/string/blank-string-validator";

/**
 * This class has basic role service methods.
 */
export class RoleService {
	public static createInstance(roleDao: RoleDao) {
		return this._instance || (this._instance = new this(roleDao));
	}

	private static _instance: RoleService;
	public ROLE = "Authorization Context";
	public ROLE_NOT_IN_DATABASE = "The role with this id does not exist in the database";
	private _log = logger.getLogger("RoleService");
	private roleDao: RoleDao;

	private constructor(roleDao: RoleDao) {
		this.roleDao = roleDao;
	}

	/**
	 * Find all roles
	 * @return {Promise<U>}
	 */
	public findAll(): Promise<any[]> {
		this._log.debug("Call to findAll Method");
		return this.roleDao.findAll()
			.then((roles: JanuxAuthorize.Role[]) => {
				return roles;
			});
	}

	/**
	 * Find one role by its name.
	 * @param rolename
	 * @return {Promise<any>}
	 */
	public findOneByName(roleName: string): Promise<any> {
		this._log.debug("Call to findOneByName with roleName: %j", roleName);
		let result: any;
		return this.roleDao.findOneByName(roleName)
			.then((role: JanuxAuthorize.Role) => {
				if (_.isNil(role)) return Promise.reject("No role with the rolename " + roleName);
				result = role;
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Find one role by its id.
	 * @param id The id
	 * @return {Promise<any>}
	 */
	public findOneById(id: any): Promise<any> {
		this._log.debug("Call to findOneByUserId with id: %j", id);
		let result: any;
		return this.roleDao.findOne(id)
			.then((role: JanuxAuthorize.Role) => {
				if (_.isNil(role)) return Promise.reject("No role with the id " + id);
				result = role;
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Insert a new role
	 * @param object The role info to insert.
	 * @return {Promise<any>}
	 */
	public insert(object: any): Promise<any> {
		this._log.debug("Call to insertMethod with object %j", object);
		const role: JanuxAuthorize.Role = JanuxAuthorize.Role.fromJSON(object);
		role.id = object.id;

		// Validate role
		const errors = RoleValidator.validateRole(role);
		if (errors.length > 0) {
			return Promise.reject(errors);
		}

		return this.roleDao.insert(role);
	}

	/**
	 * Update the role data
	 * @param object The role to be updated.
	 */
	public update(object: any): Promise<any> {
		this._log.debug("Call to updateMethod with object:%j", object);

		let role: JanuxAuthorize.Role;
		// Find the role. This also helps to retrieve the contactId.
		return this.roleDao.findOne(object.id)
			.then((resultQuery) => {
				if (resultQuery === null) {
					return Promise.reject([
						new ValidationErrorImpl(this.ROLE, this.ROLE_NOT_IN_DATABASE, object.id)
					]);
				} else {
					role = JanuxAuthorize.Role.fromJSON(object);
					role.id = object.id;

					return this.roleDao.update(role);
				}
			})
			.then((updatedRole: JanuxAuthorize.Role) => {
				return Promise.resolve(updatedRole);
			});
	}

	/**
	 * Delete an role by its id
	 * @param roleId The role id.
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteById(roleId: string): Promise<any> {
		this._log.debug("Call to deleteById with roleId: %j", roleId);

		return this.roleDao.findOne(roleId)
			.then((resultQuery: JanuxAuthorize.Role) => {
				return this.roleDao.remove(resultQuery);
			});
	}

	/**
	 * Delete an role by its name
	 * @param roleName The role name
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteByName(roleName: string): Promise<any> {
		this._log.debug("Call to deleteById with roleName: %j", roleName);

		return this.roleDao.findOneByName(roleName)
			.then((resultQuery: JanuxAuthorize.Role) => {
				return this.roleDao.remove(resultQuery);
			});
	}

	/**
	 * Save or update an role
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
