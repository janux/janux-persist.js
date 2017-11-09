/**
 * Project
 * Created by alejandro janux on 2017-09-25
 */

import Promise = require("bluebird");
import JanuxAuthorize = require("janux-authorize");
import {GroupImpl} from "services/group-module/impl/group";
import {GroupPropertiesImpl} from "services/group-module/impl/group-properties";

export interface AuthContextGroupService {

	// This is the type of the authContexts groups.
	AUTHCONTEXT_GROUP_TYPE: string;

	/**
	 * Return all group properties.
	 * @return {Promise<GroupPropertiesImpl[]>}
	 */
	findGroupProperties(): Promise<GroupPropertiesImpl[]>;

	/**
	 * Find all groups ( not content ) that belong to the authContext.
	 * @param {string} type
	 * @param {JanuxAuthorize.AuthorizationContext} authContext
	 * @return {Promise<GroupPropertiesImpl[]>}
	 */
	findPropertiesByTypeAndItem(type: string, authContext: any): Promise<GroupPropertiesImpl[]>;

	/**
	 * Find one group
	 * @param {string} code
	 * @return {Promise<GroupImpl<JanuxAuthorize.AuthorizationContext>>}
	 * Return the group or null if there is no group given the code.
	 */
	findOne(code: string): Promise<GroupImpl<any>>;

	/**
	 * Return all groups (including content) of all groups of the authContexts type.
	 * @return {Promise<Array<GroupImpl<JanuxAuthorize.AuthorizationContext>>>}
	 */
	findAll(): Promise<Array<GroupImpl<any>>>;

	/**
	 *
	 * This method helps to insert the auth contexts to a defined group identified by its code. Also
	 * removes the old associations to make sure an auth context does no belong to more than one group.
	 *
	 * @param authContext
	 * @param newGroupCode
	 * @return {Promise<any>} Return a promise indicating the item is inserted.
	 */
	switchToNewGroup(authContext: any, newGroupCode: string): Promise<any>;

	/**
	 * Inserts a new group.
	 * @param {GroupImpl} group to insert.
	 * @return {Promise<GroupImpl>} Returns a promise if the object was inserted correctly. Returns a reject if
	 * there is another group with the same code. Returns a reject if the content of the groups
	 * has duplicated values or any of the  authContexts does not exists in the database.
	 */
	insert(group: GroupImpl<any>): Promise<GroupImpl<any>>;

	/**
	 * Updates a group and it's values.
	 * @param {Group} group The group to be updated.
	 * @return {Promise<Group>} Returns a reject if there is no group with the specified type an properties.
	 * Returns a reject if the content of the groups has duplicated values.
	 * Returns a reject if the content of the groups has duplicated values or any of the  authContexts does not exists in the database.
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
	 * @param {t} authContext The value to insert.
	 * @return {Promise<any>} Return a promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null or does not exits in the database.
	 */
	addItem(code: string, authContext: any): Promise<null>;

	/**
	 * Removes an item of the group.
	 * @param {string} code.
	 * @param authContext The object to remove.
	 * Return a promise if the remove was successful.
	 * Returns a reject if there is no group given the code.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItem(code: string, authContext: any): Promise<null>;

	/**
	 * Find many groups and it's content.
	 * @param {} filter A key-value map that will help to filter the groups that shares the same type. This is as a AND filter.
	 * If there is an empty map then the method will return all records of the same type.
	 * @return {Promise<Group[]>} Return a list of groups. Returns an empty array if there is no group that qualifies
	 * with the type and filter.
	 */
	findByFilter(filter: { [p: string]: string }): Promise<Array<GroupImpl<any>>>;
}
