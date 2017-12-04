/**
 * Project glarus-services
 * Created by ernesto on 10/27/17.
 */
import Promise = require("bluebird");
import {PartyAbstract} from "janux-people";
import {Group} from "services/group-module/api/group";
import {GroupProperties} from "services/group-module/api/group-properties";
import {PartyGroupItem} from "services/party-group-service/api/party-group-item";

export interface PartyGroupService {

	/**
	 * Find all group (no content ) where the party is the owner fo the groups.
	 * @param {string} partyId The owner of the group.
	 * @param {string[]} types The types of groups to look for.
	 * @return {Bluebird<GroupProperties[]>}
	 */
	findPropertiesOwnedByPartyAndTypes(partyId: string, types: string[]): Promise<GroupProperties[]>;

	/**
	 * Find all group (no content) given the type.
	 * @param {string} type
	 */
	findPropertiesByType(type: string): Promise<GroupProperties[]>;

	/**
	 * Find one group
	 * @param {string} code
	 * @return {Promise<GroupImpl<PartyAbstract >>}
	 * Return the group or null if there is no group given the code.
	 */
	findOne(code: string): Promise<Group<PartyGroupItem>>;

	/**
	 * Find one group given the type and the owner of the group.
	 * @param {string} partyId
	 * @param {string} type
	 * @return {Bluebird<Group<PartyGroupItem>>}
	 */
	findOneOwnedByPartyAndType(partyId: string, type: string): Promise<Group<PartyGroupItem>>;

	/**
	 * Return all groups (including content) of all groups of a given types.
	 * @param {string[]} types
	 * @return {Bluebird<Array<Group<PartyGroupItem>>>}
	 */
	findByTypes(types: string[]): Promise<Array<Group<PartyGroupItem>>>;

	/**
	 * Inserts a new group.
	 * @param partyId Owner of the group. This variables in inserted as an group attribute.
	 * @param {GroupImpl} group to insert.
	 * @return {Promise<GroupImpl>} Returns a Promise if the object was inserted correctly.
	 * Returns a reject if there is another group with the same code.
	 * Returns a reject if the content of the groups has duplicated values or any of the parties does not exists in the database.
	 * Returns a reject if the owner does not exist in the database.
	 * Returns a reject if there is a party group with the same owner and type.
	 */
	insert(partyId: string, group: Group<any>): Promise<Group<PartyGroupItem>>;

	/**
	 * Updates a group and it's values.
	 * @param {Group} group The group to be updated.
	 * @return {Promise<Group>}
	 * Returns a reject if there is no group with the specified code.
	 * Returns a reject if there is an attempt to modify the owner the the group.
	 * Returns a reject if the content of the groups has duplicated values.
	 * Returns a reject if the content of the groups has duplicated values or any of the parties does not exists in the database.
	 */
	update(group: Group<any>): Promise<Group<PartyGroupItem>>;

	/**
	 * Delete group.
	 * @param {Group} code
	 * @return {Promise<any>} Returns a reject if there is no group with the specified code.
	 */
	remove(code: string): Promise<any>;

	/**
	 * Insert an element to an existing group.
	 * @param {string} code The group code.
	 * @param item The item to insert.
	 * @return {Promise<any>} Return a Promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null or does not exits in the database.
	 */
	addItem(code: string, item: PartyGroupItem): Promise<any>;

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
