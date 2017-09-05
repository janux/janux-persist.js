/**
 * Project
 * Created by ernesto on 9/4/17.
 */
import Promise = require("bluebird");
import * as _ from 'lodash';
import * as logger from '../../../util/logger-api/logger-api';
import {GroupImpl} from "../../group-module/impl/group";
import {GroupPropertiesImpl} from "../../group-module/impl/group-properties";
import {GroupServiceImpl} from "../../group-module/impl/group-service";
import {UserService} from "../../user/user-service";
import {UserGroupService} from "../api/user-group-service";

export class UserGroupServiceImpl implements UserGroupService {

	public readonly USERS_GROUP_TYPE: string = "users groups";
	public readonly NO_USERS = "There are some users in the group that does not exits in the database";
	private log = logger.getLogger("UserGroupServiceImpl");
	private userService: UserService;
	private readonly REFERENCE_ID = 'id';
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
		return this.groupService.findPropertiesByType(this.USERS_GROUP_TYPE);
	}

	findPropertiesByTypeAndItem(type: string, user: any): Promise<GroupPropertiesImpl[]> {
		return this.groupService.findPropertiesByTypeAndItem(this.USERS_GROUP_TYPE, user[this.REFERENCE_ID]);
	}

	/**
	 * Get one group
	 * @param {string} code
	 * @return {Promise<GroupImpl<any>>}
	 */
	findOne(code: string): Promise<GroupImpl<any>> {
		let result: GroupImpl<any>;
		return this.groupService.findOne(code)
			.then((resultQuery: GroupImpl<any>) => {
				if (resultQuery == null) return Promise.resolve(null);
				// Map the ids to users.
				result = _.clone(resultQuery);
				return this.userService.findByIdsIn(result.values)
					.then((users: any[]) => {
						if (result.values.length !== users.length) {
							this.log.warn("The amount of users associated does not match with the users in the database");
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
		return this.groupService.findAll(this.USERS_GROUP_TYPE)
			.then((groups: Array<GroupImpl<any>>) => {
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
		this.log.debug("Call to insert with group %j", group);
		// Map the users data in order to insert only the ids
		const newGroup: GroupImpl<any> = _.clone(group);
		const ids = group.values.map((value) => value.id);
		newGroup.values = ids;
		return this.userService.findByIdsIn(ids)
			.then((resultQuery: any[]) => {
				if (resultQuery.length !== ids.length) {
					return Promise.reject(this.NO_USERS);
				}
				return this.groupService.insert(newGroup);
			})
			.then((result) => {
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
		// Map the ids
		const groupToUpdate: GroupImpl<any> = _.clone(group);
		const ids = group.values.map((value) => value.id);
		groupToUpdate.values = ids;

		return this.userService.findByIdsIn(ids)
			.then((resultQuery: any[]) => {
				if (resultQuery.length !== ids.length) {
					return Promise.reject(this.NO_USERS);
				}
				return this.groupService.update(groupToUpdate);
			})
			.then((result) => {
				return Promise.resolve(group);
			});
	}

	/**
	 * Delete group.
	 * @param {Group} code
	 * @return {Promise<any>} Returns a reject if there is no group with the specified code.
	 */
	remove(code: string): Promise<any> {
		return this.groupService.remove(code);
	}

	/**
	 * Insert an element to an existing group.
	 * @param {string} code
	 * @param {t} user The value to insert.
	 * @return {Bluebird<any>} Return a promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null or does not exits in the database.
	 */
	addItem(code: string, user: any): Promise<any> {
		return this.userService.findOneById(user.id)
			.then((resultQuery) => {
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
		return this.groupService.removeItem(code, user[this.REFERENCE_ID]);
	}

	/**
	 * Find many groups and it's content.
	 * @param {} filter A key-value map that will help to filter the groups that shares the same type. This is as a AND filter.
	 * If there is an empty map then the method will return all records of the same type.
	 * @return {Bluebird<Group[]>} Return a list of groups. Returns an empty array if there is no group that qualifies
	 * with the type and filter.
	 */
	findByFilter(filter: { [p: string]: string }): Promise<Array<GroupImpl<any>>> {
		return this.groupService.findByTypeAndFilter(this.USERS_GROUP_TYPE, filter)
			.then((groups: Array<GroupImpl<string>>) => {
				return this.mapData(groups);
			});
	}

	private mapData(groups: Array<GroupImpl<string>>): Promise<Array<GroupImpl<any>>> {
		// Map the ids to users.
		let usersIds: string[] = [];
		for (const group of groups) {
			usersIds = usersIds.concat(group.values);
		}
		usersIds = _.uniq(usersIds);
		return this.userService.findByIdsIn(usersIds)
			.then((users: any[]) => {
				const result: Array<GroupImpl<any>> = _.clone(groups);
				for (const it of result) {
					it.values = it.values.map((value) => {
						const filteredUser = users.filter((value2) => value2.id === value);
						if (filteredUser.length === 0) {
							this.log.warn("There is no associated user with the id %j", value);
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
