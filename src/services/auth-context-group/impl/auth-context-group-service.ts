/**
 * Project
 * Created by alejandro janux on 2017-09-25
 */

import Promise = require("bluebird");
import * as _ from "lodash";
import { AuthContextGroupService } from "services/auth-context-group/api/auth-context-group-service";
import { AuthContextService } from "services/auth-context/auth-context-service";
import { GroupImpl } from "services/group-module/impl/group";
import { GroupPropertiesImpl } from "services/group-module/impl/group-properties";
import { GroupServiceImpl } from "services/group-module/impl/group-service";
import * as logger from "utils/logger-api/logger-api";

export class AuthContextGroupServiceImpl implements AuthContextGroupService {
	public readonly AUTHCONTEXT_GROUP_TYPE: string = "auth context display group";
	public readonly NO_AUTHCONTEXTS = "There are some authContext in the group that does not exits in the database";
	private log = logger.getLogger("AuthContextGroupServiceImpl");
	private authContextService: AuthContextService;
	private readonly REFERENCE_ID = "id";
	private groupService: GroupServiceImpl<string>;

	constructor(authContextService: AuthContextService, groupService: GroupServiceImpl<any>) {
		this.authContextService = authContextService;
		this.groupService = groupService;
	}

	/**
	 * Return all authContext groups names, code and attributes (no content) of the groups
	 * of the same type. This method helps to fill the content in the combo box where the user
	 * can select the different authorization context display groups.
	 *
	 * @return {Promise<GroupPropertiesImpl[]>}
	 */
	findGroupProperties(): Promise<GroupPropertiesImpl[]> {
		this.log.trace("finding auth-context group properties");
		return this.groupService.findPropertiesByType(this.AUTHCONTEXT_GROUP_TYPE);
	}

	/**
	 * Return the group where the auth context is associated.
	 *
	 * This method is used when we want to insert or edit a auth-context.
	 * When we want to show the associated group in the combo box.
	 * @param item
	 * @return {Promise<GroupPropertiesImpl[]>}
	 */
	findPropertiesByTypeAndItem(authContext: any): Promise<GroupPropertiesImpl[]> {
		this.log.trace("finding auth-context group properties for item %j", authContext[this.REFERENCE_ID]);
		return this.groupService.findPropertiesByTypeAndItem(
			this.AUTHCONTEXT_GROUP_TYPE,
			authContext[this.REFERENCE_ID]
		);
	}

	/**
	 * Get one group
	 * @param {string} code
	 * @return {Promise<GroupImpl<any>>}
	 */
	findOne(code: string): Promise<GroupImpl<any>> {
		this.log.trace("finding auth-context group by code %j", code);
		let result: GroupImpl<any>;
		return this.groupService.findOne(code).then((resultQuery: GroupImpl<any>) => {
			if (resultQuery == null) return Promise.resolve(null);
			// Map the ids to authContext.
			result = _.clone(resultQuery);
			return this.authContextService.findByIdsIn(result.values).then((authContext: any[]) => {
				if (result.values.length !== authContext.length) {
					this.log.warn(
						"auth-context group %j: %j associated ids but only %j found in the database",
						code,
						result.values.length,
						authContext.length
					);
				}
				result.values = authContext;
				return Promise.resolve(result);
			});
		});
	}

	/**
	 * Returns all authContext groups.
	 * @return {Promise<GroupImpl<any>>}
	 */
	findAll(): Promise<Array<GroupImpl<any>>> {
		this.log.debug("finding all auth-context groups");
		return this.groupService.findAll(this.AUTHCONTEXT_GROUP_TYPE).then((groups: Array<GroupImpl<any>>) => {
			return this.mapData(groups);
		});
	}

	/**
	 *
	 * This method helps to insert the auth contexts to a defined group identified by its code. Also
	 * removes the old associations to make sure an auth context does no belong to more than one group.
	 *
	 * @param authContext
	 * @param newGroupCode
	 */
	switchToNewGroup(authContext: any, newGroupCode: string): Promise<any> {
		this.log.debug(
			"switching auth-context %j to group %j",
			authContext[this.REFERENCE_ID],
			newGroupCode
		);
		// Remove the associations with existing groups.
		return this.groupService
			.removeItemByType(this.AUTHCONTEXT_GROUP_TYPE, authContext[this.REFERENCE_ID])
			.then(resultQuery => {
				// Adds the new association.
				return this.groupService.addItem(newGroupCode, authContext[this.REFERENCE_ID]);
			})
			.then((result: any) => {
				this.log.info("switched auth-context %j to group %j", authContext[this.REFERENCE_ID], newGroupCode);
				return result;
			});
	}

	/**
	 * Inserts a new group.
	 * @param {GroupImpl<any>} group
	 * Return the inserted group.
	 * Returns a reject if the authContext to associate to the group does not exists in
	 * the database.
	 */
	insert(group: GroupImpl<any>): Promise<GroupImpl<any>> {
		// Ensure authorization context group type
		group.type = this.AUTHCONTEXT_GROUP_TYPE;
		this.log.debug("inserting auth-context group %j", group);
		// Map the authContext data in order to insert only the ids
		const newGroup: GroupImpl<any> = _.clone(group);
		const ids = group.values.map(value => value.id);
		newGroup.values = ids;
		return this.authContextService
			.findByIdsIn(ids)
			.then((resultQuery: any[]) => {
				if (resultQuery.length !== ids.length) {
					this.log.warn("failed to insert auth-context group %j: some auth contexts do not exist", group.code);
					return Promise.reject(this.NO_AUTHCONTEXTS);
				}
				return this.groupService.insert(newGroup);
			})
			.then(result => {
				this.log.info("inserted auth-context group -> code %j", group.code);
				return Promise.resolve(group);
			});
	}

	/**
	 * Updates a group and it's values.
	 * @param {Group} group The group to be updated.
	 * @return {Promise<Group>} Returns a reject if there is no group with the specified type an properties.
	 * Returns a reject if the content of the groups has duplicated values.
	 * Returns a reject if the content of the groups has duplicated values or any of the  authContext does not exists in the database.
	 */
	update(group: GroupImpl<any>): Promise<GroupImpl<any>> {
		this.log.debug("updating auth-context group %j", group);
		// Map the ids
		const groupToUpdate: GroupImpl<any> = _.clone(group);
		const ids = group.values.map(value => value.id);
		groupToUpdate.values = ids;

		return this.authContextService
			.findByIdsIn(ids)
			.then((resultQuery: any[]) => {
				if (resultQuery.length !== ids.length) {
					this.log.warn("failed to update auth-context group %j: some auth contexts do not exist", group.code);
					return Promise.reject(this.NO_AUTHCONTEXTS);
				}
				return this.groupService.update(groupToUpdate);
			})
			.then(result => {
				this.log.info("updated auth-context group -> code %j", group.code);
				return Promise.resolve(group);
			});
	}

	/**
	 * Updates order of authorization context groups
	 * @param groupsOrder Array of objects containing group code and sort order
	 * @return {Promise<<any>}
	 */
	updateGroupsSortOrder(groupsOrder: any): Promise<any> {
		this.log.debug("updating sort order for %j auth-context groups", groupsOrder.length);
		return this.findAll()
			.then(groups => {
				return Promise.map(groups, group => {
					const groupToUpdate: GroupImpl<any> = _.clone(group);
					const ids = group.values.map(value => value.id);
					const newAttribues: any = _.find(groupsOrder, {
						code: groupToUpdate.code
					});

					groupToUpdate.values = ids;
					groupToUpdate.attributes = newAttribues.attributes;

					return this.groupService.update(groupToUpdate);
				});
			})
			.then(updateGroups => {
				return Promise.all(updateGroups).then((result: any[]) => {
					this.log.info("updated sort order for %j auth-context groups", result.length);
					return result;
				});
			});
	}

	/**
	 * Delete group.
	 * @param {Group} code
	 * @return {Promise<any>} Returns a reject if there is no group with the specified code.
	 */
	remove(code: string): Promise<any> {
		this.log.debug("removing auth-context group by code %j", code);
		return this.groupService.remove(code);
	}

	/**
	 * Insert an element to an existing group.
	 * @param {string} code
	 * @param {t} auth-context The value to insert.
	 * @return {Promise<any>} Return a promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null or does not exits in the database.
	 */
	addItem(code: string, authContext: any): Promise<any> {
		this.log.debug("adding auth-context %j to group %j", authContext[this.REFERENCE_ID], code);
		return this.authContextService.findOneById(authContext.id).then(resultQuery => {
			return this.groupService.addItem(code, authContext[this.REFERENCE_ID]);
		});
	}

	/**
	 * Removes an item of the group.
	 * @param {string} code.
	 * @param auth-context The object to remove.
	 * Return a promise if the remove was successful.
	 * Returns a reject if there is no group given the code.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItem(code: string, authContext: any): Promise<any> {
		this.log.debug("removing auth-context %j from group %j", authContext[this.REFERENCE_ID], code);
		return this.groupService.removeItem(code, authContext[this.REFERENCE_ID]);
	}

	/**
	 * Find many groups and it's content.
	 * @param {} filter A key-value map that will help to filter the groups that shares the same type. This is as a AND filter.
	 * If there is an empty map then the method will return all records of the same type.
	 * @return {Promise<Group[]>} Return a list of groups. Returns an empty array if there is no group that qualifies
	 * with the type and filter.
	 */
	findByFilter(filter: { [p: string]: string }): Promise<Array<GroupImpl<any>>> {
		this.log.debug("finding auth-context groups by filter %j", filter);
		return this.groupService
			.findByTypeAndFilter(this.AUTHCONTEXT_GROUP_TYPE, filter)
			.then((groups: Array<GroupImpl<string>>) => {
				return this.mapData(groups);
			});
	}

	private mapData(groups: Array<GroupImpl<string>>): Promise<Array<GroupImpl<any>>> {
		this.log.trace("mapping data for %j auth-context groups", groups.length);
		// Map the ids to authContext.
		let authContextIds: string[] = [];
		for (const group of groups) {
			authContextIds = authContextIds.concat(group.values);
		}
		authContextIds = _.uniq(authContextIds);
		return this.authContextService.findByIdsIn(authContextIds).then((authContext: any[]) => {
			const result: Array<GroupImpl<any>> = _.clone(groups);
			for (const it of result) {
				it.values = it.values.map(value => {
					const filteredAuthContext = authContext.filter(value2 => value2.id === value);
					if (filteredAuthContext.length === 0) {
						this.log.warn("no auth-context found with id %j", value);
						return undefined;
					} else {
						return filteredAuthContext[0];
					}
				});
			}
			return Promise.resolve(result);
		});
	}
}
