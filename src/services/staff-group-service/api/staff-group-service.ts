/**
 * Project janux-persist.js
 * Created by ernesto on 11/16/17.
 */
import Promise = require("bluebird");
import { PartyAbstract } from "janux-people";
import { Group } from "services/group-module/api/group";
import { GroupProperties } from "services/group-module/api/group-properties";

export interface StaffGroupService {
	/**
	 * Insert a staff group for this organization.
	 * @param {PartyAbstract} organization Returns the group
	 * inserted.
	 * Returns a reject if there is no organization with the id.
	 * Returns a reject if there is a staff group associated to this organization.
	 */
	registerOrganization(organization: PartyAbstract): Promise<Group<PartyAbstract>>;

	/**
	 * Add a person to the staff group.
	 * @param {PartyAbstract} organization
	 * @param {PartyAbstract} person
	 * Returns a promise when the person is added to the staff group.
	 * Return a reject if the organization does not exits in the database
	 * or the organization does no have a staff group.
	 * Returns a reject if the person is already inserted in a group in another company.
	 */
	addItem(organization: PartyAbstract, person: PartyAbstract): Promise<any>;

	/**
	 * Removes a person to the staff group.
	 * @param {PartyAbstract} organization
	 * @param {PartyAbstract} person
	 * Returns a promise indicating the person has been removed of the group.
	 * Returns a reject if the organization does no exist or the organization does not
	 * have a staff group.
	 */
	removeItem(organization: PartyAbstract, person: PartyAbstract): Promise<any>;

	/**
	 * Returns a group.
	 * @param {string} id
	 * @return {Group<PartyAbstract>} Returns the group.
	 * Returns a reject if there is no group given the id.
	 */
	findOne(id: string): Group<PartyAbstract>;

	/**
	 * Return all staff groups ( no content)
	 * @return {Promise<GroupProperties[]>}
	 */
	findProperties(): Promise<GroupProperties[]>;
}
