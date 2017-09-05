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
				// Map the ids to users.
				result = _.clone(resultQuery);
				return this.userService.findByIdsIn(result.values);
			})
			.then((users: any[]) => {
				if (result.values.length !== users.length) {
					this.log.warn("The amount of users associated does not match with the users in the database");
				}
				result.values = users;
				return Promise.resolve(result);
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
	 * Inserts a users groups.
	 * @param {GroupImpl<any>} group
	 */
	insert(group: GroupImpl<any>): Promise<GroupImpl<any>> {
		this.log.debug("Call to insert with group %j", group);
		// Map the users data in order to insert only the ids
		const newGroup: GroupImpl<any> = _.clone(group);
		newGroup.values = group.values.map((value) => value.id);
		return this.groupService.insert(newGroup)
			.then((result) => {
				return Promise.resolve(group);
			});
	}

	update(group: GroupImpl<any>): Promise<GroupImpl<any>> {
		// Map the ids
		const groupToUpdate: GroupImpl<any> = _.clone(group);
		groupToUpdate.values = group.values.map((value) => value.id);
		return this.groupService.update(groupToUpdate)
			.then((result) => {
				return Promise.resolve(group);
			});
	}

	remove(code: string): Promise<any> {
		return this.groupService.remove(code);
	}

	addItem(code: string, user: any): Promise<any> {
		return this.groupService.addItem(code, user[this.REFERENCE_ID]);
	}

	removeItem(code: string, user: any): Promise<any> {
		return this.groupService.removeItem(this.USERS_GROUP_TYPE, user[this.REFERENCE_ID]);
	}

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
			usersIds.concat(group.values);
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
