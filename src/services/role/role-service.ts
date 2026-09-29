/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-12
 */

import * as Promise from "bluebird";
import { RoleDao } from "daos/role/role-dao";
import { RoleValidator } from "daos/role/role-validator";
import JanuxAuthorize = require("janux-authorize");
import * as _ from "lodash";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import * as logger from "utils/logger-api/logger-api";
import { isBlankString } from "utils/string/blank-string-validator";

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
		this._log.debug("finding all roles");
		return this.roleDao.findAll().then((roles: JanuxAuthorize.Role[]) => {
			return roles;
		});
	}

	/**
	 * Find one role by its name.
	 * @param rolename
	 * @return {Promise<any>}
	 */
	public findOneByName(roleName: string): Promise<any> {
		this._log.debug("finding role by name %j", roleName);
		return this.roleDao.findOneByName(roleName).then((role: JanuxAuthorize.Role) => {
			if (_.isNil(role)) {
				this._log.warn("failed to find role by name %j: not found", roleName);
				return Promise.reject("No role with the rolename " + roleName);
			}
			return Promise.resolve(role);
		});
	}

	/**
	 * Return roles containing the following names.
	 * @param {string[]} names
	 * @return {Bluebird<any>}
	 */
	public findByNameIn(names: string[]): Promise<any> {
		this._log.debug("finding roles by names %j", names);
		return this.roleDao.findByNameIn(names);
	}

	/**
	 * Find one role by its id.
	 * @param id The id
	 * @return {Promise<any>}
	 */
	public findOneById(id: any): Promise<any> {
		this._log.debug("finding role by id %j", id);
		return this.roleDao.findOne(id).then((role: JanuxAuthorize.Role) => {
			if (_.isNil(role)) {
				this._log.warn("failed to find role by id %j: not found", id);
				return Promise.reject("No role with the id " + id);
			}
			return Promise.resolve(role);
		});
	}

	/**
	 * Insert a new role
	 * @param object The role info to insert.
	 * @return {Promise<any>}
	 */
	public insert(object: any): Promise<any> {
		this._log.debug("inserting role %j", object);
		const role: JanuxAuthorize.Role = JanuxAuthorize.Role.fromJSON(object);
		role.id = object.id;

		// Validate role
		const errors = RoleValidator.validateRole(role);
		if (errors.length > 0) {
			this._log.warn("failed to insert role %j: validation errors %j", object, errors);
			return Promise.reject(errors);
		}

		return this.roleDao.insert(role);
	}

	/**
	 * Update the role data
	 * @param object The role to be updated.
	 */
	public update(object: any): Promise<any> {
		this._log.debug("updating role %j", object);

		let role: JanuxAuthorize.Role;
		// Find the role.
		return this.roleDao
			.findOne(object.id)
			.then(resultQuery => {
				if (resultQuery === null) {
					this._log.warn("failed to update role %j: not found", object);
					return Promise.reject([new ValidationErrorImpl(this.ROLE, this.ROLE_NOT_IN_DATABASE, object.id)]);
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
	 * Update the order of the roles
	 * @param array of objects containing id and sort order of each role
	 */
	public updateSortOrder(rolesOrder: any): Promise<any> {
		this._log.debug("updating sort order for %j roles", rolesOrder.length);

		// Find the roles
		return this.roleDao
			.findByIds(_.map(rolesOrder, "id"))
			.then(resultQuery => {
				return Promise.map(resultQuery, aRole => {
					let role: JanuxAuthorize.Role;
					const roleObject: any = _.find(rolesOrder, {
						id: aRole.id
					});
					role = JanuxAuthorize.Role.fromJSON(aRole);
					role.id = aRole.id;
					role.sortOrder = roleObject.sortOrder;

					return this.roleDao.update(role);
				});
			})
			.then((updatedRoles: any) => {
				return Promise.all(updatedRoles).then((result: any[]) => {
					this._log.info("updated sort order for %j roles", result.length);
					return result;
				});
			});
	}

	/**
	 * Delete an role by its id
	 * @param roleId The role id.
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteById(roleId: string): Promise<any> {
		this._log.debug("deleting role by id %j", roleId);

		return this.roleDao.findOne(roleId).then((resultQuery: JanuxAuthorize.Role) => {
			if (_.isNil(resultQuery)) {
				this._log.warn("failed to delete role by id %j: not found", roleId);
				return Promise.reject("No role with the id " + roleId);
			}
			return this.roleDao.remove(resultQuery).then((result: any) => {
				this._log.info("deleted role -> id %j", roleId);
				return result;
			});
		});
	}

	/**
	 * Delete an role by its name
	 * @param roleName The role name
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteByName(roleName: string): Promise<any> {
		this._log.debug("deleting role by name %j", roleName);

		return this.roleDao.findOneByName(roleName).then((resultQuery: JanuxAuthorize.Role) => {
			if (_.isNil(resultQuery)) {
				this._log.warn("failed to delete role by name %j: not found", roleName);
				return Promise.reject("No role with the rolename " + roleName);
			}
			return this.roleDao.remove(resultQuery).then((result: any) => {
				this._log.info("deleted role -> name %j", roleName);
				return result;
			});
		});
	}

	/**
	 * Save or update an role
	 * @param object
	 * @return {Promise<any>}
	 */
	public saveOrUpdate(object: any): Promise<any> {
		this._log.debug("saveOrUpdate choosing insert or update for role %j", object);
		if (isBlankString(object.id)) {
			return this.insert(object);
		} else {
			return this.update(object);
		}
	}
}
