/**
 * Project
 * Created by ernesto on 9/4/17.
 */

import Promise = require("bluebird");
import JanuxPeople = require("janux-people");
import {GroupImpl} from "../../group-module/impl/group";
import {GroupPropertiesImpl} from "../../group-module/impl/group-properties";

export interface UserGroupService {

	// This is the type of the users groups.
	USERS_GROUP_TYPE: string;

	/**
	 * Return all group properties.
	 * @return {Bluebird<GroupPropertiesImpl[]>}
	 */
	findGroupProperties(): Promise<GroupPropertiesImpl[]>;

	/**
	 * Find all groups ( not content ) that belong to the user.
	 * @param {string} type
	 * @param {JanuxPeople.Person | JanuxPeople.Organization} user
	 * @return {Bluebird<GroupPropertiesImpl[]>}
	 */
	findPropertiesByTypeAndItem(type: string, user: any): Promise<GroupPropertiesImpl[]>;

	/**
	 * Find one group
	 * @param {string} code
	 * @return {Bluebird<GroupImpl<JanuxPeople.Person | JanuxPeople.Organization>>}
	 * Return the group or null if there is no group given the code.
	 */
	findOne(code: string): Promise<GroupImpl<any>>;

	/**
	 * Return all groups (including content) of all groups of the users type.
	 * @return {Bluebird<Array<GroupImpl<JanuxPeople.Person | JanuxPeople.Organization>>>}
	 */
	findAll(): Promise<Array<GroupImpl<any>>>;

	/**
	 * Inserts a new group.
	 * @param {GroupImpl} group to insert.
	 * @return {Promise<GroupImpl>} Returns a promise if the object was inserted correctly. Return a reject if
	 * there is another group with the same code. Returns a reject if the content of the groups
	 * has duplicated values.
	 */
	insert(group: GroupImpl<any>): Promise<GroupImpl<any>>;

	/**
	 * Updates a group and it's values.
	 * @param {Group} group The group to be updated.
	 * @return {Promise<Group>} Returns a reject if there is no group with the specified type an properties.
	 * Returns a reject if the content of the groups has duplicated values.
	 */
	update(group: GroupImpl<any>): Promise<GroupImpl<any>>;

	/**
	 * Delete group.
	 * @param {Group} code
	 * @return {Promise<any>} Returns a reject if there is no group with the specified code.
	 */
	remove(code: string): Promise<null>;

	/**
	 * Insert an element to an existing group.
	 * @param {string} code
	 * @param {t} user The value to insert.
	 * @return {Bluebird<any>} Return a promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null.
	 */
	addItem(code: string, user: any): Promise<null>;

	/**
	 * Removes an item of the group.
	 * @param {string} code.
	 * @param user The object to remove.
	 * Return a promise if the remove was successful.
	 * Returns a reject if there is no group given the code.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItem(code: string, user: any): Promise<null>;

	/**
	 * Find many groups and it's content.
	 * @param {} filter A key-value map that will help to filter the groups that shares the same type. This is as a AND filter.
	 * If there is an empty map then the method will return all records of the same type.
	 * @return {Bluebird<Group[]>} Return a list of groups. Returns an empty array if there is no group that qualifies
	 * with the type and filter.
	 */
	findByFilter(filter: { [p: string]: string }): Promise<Array<GroupImpl<any>>>;
}
