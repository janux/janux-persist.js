/**
 * Project glarus-services
 * Created by ernesto on 10/27/17.
 */
import Promise = require("bluebird");
import {PartyAbstract} from "janux-people";
import {Group} from "services/group-module/api/group";
import {GroupProperties} from "services/group-module/api/group-properties";

export interface PartyGroupService {

	/**
	 * Find all group (no content ) where the party is the owner fo the groups.
	 * @param {string[]} types The types to look for. This is necessary in order to avoid
	 * non-contact groups, like auth context groups.
	 * @param partyId
	 * @return {Promise<GroupProperties[]>}
	 */
	findPropertiesOwnedByPartyAndTypes(partyId: string, types: string[]): Promise<GroupProperties[]>;

	/**
	 * Find the group (no content) given the type and party as th owner.
	 * @param {string} partyId The party to look for.
	 * @param {string} type the group type to look for.
	 * @return {Bluebird<GroupProperties>} Returns the group where the party is associated.
	 */
	findPropertiesOwnedByPartyAndType(partyId: string, type: string): Promise<GroupProperties>;

	/**
	 * Find one group
	 * @param {string} code
	 * @return {Promise<GroupImpl<PartyAbstract >>}
	 * Return the group or null if there is no group given the code.
	 */
	findOne(code: string): Promise<Group<PartyAbstract>>;

	/**
	 * Find one group given the type and the owner of the group.
	 * @param {string} partyId The owner of the group.
	 * @param {string} type The type too look for.
	 * @return {Bluebird<Group<any>>} Returns the group or null if there is no group given
	 * the conditions.
	 */
	findOneOwnedByPartyAndType(partyId: string, type: string): Promise<Group<PartyAbstract>>;

	/**
	 * Return all groups (including content) of all groups of a given types.
	 * @return {Promise<Array<GroupImpl<JanuxPeople.PartyAbstract>>>}
	 */
	findAllByTypes(types: string[]): Promise<Array<Group<PartyAbstract>>>;

	/**
	 * Inserts a new group.
	 * @param {GroupImpl} group to insert.
	 * @return {Promise<GroupImpl>} Returns a Promise if the object was inserted correctly. Returns a reject if
	 * there is another group with the same code. Returns a reject if the content of the groups
	 * has duplicated values or any of the  users does not exists in the database.
	 */
	insert(group: Group<any>): Promise<Group<PartyAbstract>>;

	/**
	 * Updates a group and it's values.
	 * @param {Group} group The group to be updated.
	 * @return {Promise<Group>} Returns a reject if there is no group with the specified type an properties.
	 * Returns a reject if the content of the groups has duplicated values.
	 * Returns a reject if the content of the groups has duplicated values or any of the  users does not exists in the database.
	 */
	update(group: Group<any>): Promise<Group<PartyAbstract>>;

	/**
	 * Delete group.
	 * @param {Group} code
	 * @return {Promise<any>} Returns a reject if there is no group with the specified code.
	 */
	remove(code: string): Promise<any>;

	/**
	 * Insert an element to an existing group.
	 * @param {string} code The group code.
	 * @param {t} party The value to insert.
	 * @return {Promise<any>} Return a Promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null or does not exits in the database.
	 */
	addItem(code: string, party: PartyAbstract): Promise<any>;

	/**
	 * Removes an item of the group.
	 * @param {string} code.
	 * @param party The object to remove.
	 * Return a Promise if the remove was successful.
	 * Returns a reject if there is no group given the code.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItem(code: string, party: PartyAbstract): Promise<any>;

}
