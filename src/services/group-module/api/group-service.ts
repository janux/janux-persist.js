/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");
import {Group} from "./group";
import {GroupProperties} from "./group-properties";

export interface GroupService<t> {

	/**
	 * Return all group properties that shares the same type.
	 * @param {string} type
	 * @return {Promise<GroupProperties[]>} Return a list of group references.
	 */
	findPropertiesByType(type: string): Promise<GroupProperties[]>;

	/**
	 * Return all groups where the object is defined.
	 * @param {string} type The type of groups to filter.
	 * @param {t} object The object to look for.
	 * @return {Promise<GroupPropertiesImpl[]>} Returns a promise indicating the groups where the object
	 * is defined.
	 */
	findPropertiesByTypeAndItem(type: string, object: t): Promise<GroupProperties[]>;

	/**
	 * Find all groups that belongs to the same type.
	 * @param {string} type The type to look for.
	 * @return {Promise<Array<Group<t>>>} Return a list of groups. Returns an empty array if there is no
	 * group with this type.
	 */
	findAll(type: string): Promise<Array<Group<t>>>;

	/**
	 * Find one group given the code.
	 * @param {string} code
	 * @return {Promise<Group<t>>} Return the group or null if there is no group given the code.
	 */
	findOne(code: string): Promise<Group<t>>;

	/**
	 * Find many groups and it's content.
	 * @param {string} type. The type to look for.
	 * @param {} filter A key-value map that will help to filter the groups that shares the same type. This is as a AND filter.
	 * If there is an empty map then the method will return all records of the same type.
	 * @return {Promise<Group[]>} Return a list of groups. Returns an empty array if there is no group that qualifies
	 * with the type and filter.
	 */
	findByTypeAndFilter(type: string, filter: { [p: string]: string }): Promise<Array<Group<t>>>;

	/**
	 * Inserts a new group.
	 * @param {GroupImpl} group to insert.
	 * @return {Promise<GroupImpl>} Returns a promise if the object was inserted correctly. Return a reject if
	 * there is another group with the same code. Returns a reject if the content of the groups
	 * has duplicated values.
	 */
	insert(group: Group<t>): Promise<Group<t>>;

	/**
	 * Updates a group and it's values.
	 * @param {Group} group The group to be updated.
	 * @return {Promise<Group>} Returns a reject if there is no group with the specified type an properties.
	 * Returns a reject if the content of the groups has duplicated values.
	 */
	update(group: Group<t>): Promise<Group<t>>;

	/**
	 * Delete group.
	 * @param {Group} code
	 * @return {Promise<any>} Returns a reject if there is no group with the specified code.
	 */
	remove(code: string): Promise<null>;

	/**
	 * Insert an element to an existing group.
	 * @param {string} code
	 * @param {t} objectToInsert The value to insert.
	 * @return {Promise<any>} Return a promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null.
	 */
	addItem(code: string, objectToInsert: t): Promise<null>;

	/**
	 * Removes an item of the group.
	 * @param {string} code.
	 * @param objectToRemove The object to remove.
	 * Return a promise if the remove was successful.
	 * Returns a reject if there is no group given the code.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItem(code: string, objectToRemove: t): Promise<null>;

	/**
	 * Removes the object to all groups that has the same type.
	 * @param {string} type the type of the groups to look for.
	 * @param {t} objectToRemove The object to remove.
	 * @return {Promise<any>} Returns a promise indicating the operation was done.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItemByType(type: string, objectToRemove: t): Promise<any>;
}
