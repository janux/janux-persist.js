/**
 * Project
 * Created by ernesto on 9/4/17.
 */
import Promise = require("bluebird");
import * as _ from "lodash";
import { GroupImpl } from "services/group-module/impl/group";
import { GroupPropertiesImpl } from "services/group-module/impl/group-properties";
import { GroupServiceImpl } from "services/group-module/impl/group-service";
import { UserGroupService } from "services/user-group-service/api/user-group-service";
import { UserService } from "services/user/user-service";
import * as logger from "utils/logger-api/logger-api";

export class UserGroupServiceImpl implements UserGroupService {
	public readonly USERS_GROUP_TYPE: string = "users groups";
	public readonly NO_USERS = "There are some users in the group that does not exits in the database";
	private log = logger.getLogger("UserGroupServiceImpl");
	private userService: UserService;
	private readonly REFERENCE_ID = "id";
	private groupService: GroupServiceImpl<string>;

	constructor(userService: UserService, groupService: GroupServiceImpl<any>) {
		this.userService = userService;
		this.groupService = groupService;
	}

	/**
	 * Return all users groups names and properties.
	 * @return {Promise<GroupPropertiesImpl[]>}
	 */
	findGroupProperties(): Promise<GroupPropertiesImpl[]> {
		this.log.trace("finding user group properties");
		return this.groupService.findPropertiesByType(this.USERS_GROUP_TYPE);
	}

	findPropertiesByTypeAndItem(type: string, user: any): Promise<GroupPropertiesImpl[]> {
		this.log.trace("finding user group properties for item %j", user[this.REFERENCE_ID]);
		return this.groupService.findPropertiesByTypeAndItem(this.USERS_GROUP_TYPE, user[this.REFERENCE_ID]);
	}

	/**
	 * Get one group
	 * @param {string} code
	 * @return {Promise<GroupImpl<any>>}
	 */
	findOne(code: string): Promise<GroupImpl<any>> {
		this.log.trace("finding user group by code %j", code);
		let result: GroupImpl<any>;
		return this.groupService.findOne(code).then((resultQuery: GroupImpl<any>) => {
			if (resultQuery == null) return Promise.resolve(null);
			// Map the ids to users.
			result = _.clone(resultQuery);
			return this.userService.findByIdsIn(result.values).then((users: any[]) => {
				if (result.values.length !== users.length) {
					this.log.warn(
						"user group %j: %j associated ids but only %j found in the database",
						code,
						result.values.length,
						users.length
					);
				}
				result.values = users;
				return Promise.resolve(result);
			});
		});
	}

	/**
	 * Returns all users groups.
	 * @return {Promise<GroupImpl<any>>}
	 */
	findAll(): Promise<Array<GroupImpl<any>>> {
		this.log.debug("finding all user groups");
		return this.groupService.findAll(this.USERS_GROUP_TYPE).then((groups: Array<GroupImpl<any>>) => {
			return this.mapData(groups);
		});
	}

	/**
	 * Inserts a new group.
	 * @param {GroupImpl<any>} group
	 * Return the inserted group.
	 * Returns a reject if the users to associate to the group does not exists in
	 * the database.
	 */
	insert(group: GroupImpl<any>): Promise<GroupImpl<any>> {
		this.log.debug("inserting user group %j", group);
		// Map the users data in order to insert only the ids
		const newGroup: GroupImpl<any> = _.clone(group);
		const ids = group.values.map(value => value.id);
		newGroup.values = ids;
		return this.userService
			.findByIdsIn(ids)
			.then((resultQuery: any[]) => {
				if (resultQuery.length !== ids.length) {
					this.log.warn("failed to insert user group %j: some users do not exist", group.code);
					return Promise.reject(this.NO_USERS);
				}
				return this.groupService.insert(newGroup);
			})
			.then(result => {
				this.log.info("inserted user group -> code %j", group.code);
				return Promise.resolve(group);
			});
	}

	/**
	 * Updates a group and it's values.
	 * @param {Group} group The group to be updated.
	 * @return {Promise<Group>} Returns a reject if there is no group with the specified type an properties.
	 * Returns a reject if the content of the groups has duplicated values.
	 * Returns a reject if the content of the groups has duplicated values or any of the  users does not exists in the database.
	 */
	update(group: GroupImpl<any>): Promise<GroupImpl<any>> {
		this.log.debug("updating user group %j", group);
		// Map the ids
		const groupToUpdate: GroupImpl<any> = _.clone(group);
		const ids = group.values.map(value => value.id);
		groupToUpdate.values = ids;

		return this.userService
			.findByIdsIn(ids)
			.then((resultQuery: any[]) => {
				if (resultQuery.length !== ids.length) {
					this.log.warn("failed to update user group %j: some users do not exist", group.code);
					return Promise.reject(this.NO_USERS);
				}
				return this.groupService.update(groupToUpdate);
			})
			.then(result => {
				this.log.info("updated user group -> code %j", group.code);
				return Promise.resolve(group);
			});
	}

	/**
	 * Delete group.
	 * @param {Group} code
	 * @return {Promise<any>} Returns a reject if there is no group with the specified code.
	 */
	remove(code: string): Promise<any> {
		this.log.debug("removing user group by code %j", code);
		return this.groupService.remove(code);
	}

	/**
	 * Insert an element to an existing group.
	 * @param {string} code
	 * @param {t} user The value to insert.
	 * @return {Promise<any>} Return a promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null or does not exits in the database.
	 */
	addItem(code: string, user: any): Promise<any> {
		this.log.debug("adding user %j to group %j", user[this.REFERENCE_ID], code);
		return this.userService.findOneById(user.id).then(resultQuery => {
			return this.groupService.addItem(code, user[this.REFERENCE_ID]);
		});
	}

	/**
	 * Removes an item of the group.
	 * @param {string} code.
	 * @param user The object to remove.
	 * Return a promise if the remove was successful.
	 * Returns a reject if there is no group given the code.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItem(code: string, user: any): Promise<any> {
		this.log.debug("removing user %j from group %j", user[this.REFERENCE_ID], code);
		return this.groupService.removeItem(code, user[this.REFERENCE_ID]);
	}

	/**
	 * Find many groups and it's content.
	 * @param {} filter A key-value map that will help to filter the groups that shares the same type. This is as a AND filter.
	 * If there is an empty map then the method will return all records of the same type.
	 * @return {Promise<Group[]>} Return a list of groups. Returns an empty array if there is no group that qualifies
	 * with the type and filter.
	 */
	findByFilter(filter: { [p: string]: string }): Promise<Array<GroupImpl<any>>> {
		this.log.debug("finding user groups by filter %j", filter);
		return this.groupService
			.findByTypeAndFilter(this.USERS_GROUP_TYPE, filter)
			.then((groups: Array<GroupImpl<string>>) => {
				return this.mapData(groups);
			});
	}

	private mapData(groups: Array<GroupImpl<string>>): Promise<Array<GroupImpl<any>>> {
		this.log.trace("mapping data for %j user groups", groups.length);
		// Map the ids to users.
		let usersIds: string[] = [];
		for (const group of groups) {
			usersIds = usersIds.concat(group.values);
		}
		usersIds = _.uniq(usersIds);
		return this.userService.findByIdsIn(usersIds).then((users: any[]) => {
			const result: Array<GroupImpl<any>> = _.clone(groups);
			for (const it of result) {
				it.values = it.values.map(value => {
					const filteredUser = users.filter(value2 => value2.id === value);
					if (filteredUser.length === 0) {
						this.log.warn("no user found with id %j", value);
						return undefined;
					} else {
						return filteredUser[0];
					}
				});
			}
			return Promise.resolve(result);
		});
	}
}
