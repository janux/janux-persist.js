/**
 * Project janux-persist.js
 * Created by ernesto on 11/9/17.
 */
import Promise = require("bluebird");
import JanuxPeople = require("janux-people");
import {ValidationError} from "persistence/api/dao/validation-error";

export interface PartyService {
	/**
	 * Find all record that matches with the name,
	 * @param {string} name
	 * @return {Promise}
	 */
	findByName(name: string): Promise<JanuxPeople.Party[]>;

	/**
	 * Find all records that has the email address.
	 * @param {string} email
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findByEmail(email: string): Promise<JanuxPeople.Party[]>;

	/**
	 * Find all records that hast the phone number.
	 * @param {string} phone
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findByPhone(phone: string): Promise<JanuxPeople.Party[]>;

	/**
	 * Find all people
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findPeople(): Promise<JanuxPeople.Party[]>;

	/**
	 * Find all organizations
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findOrganizations(): Promise<JanuxPeople.Party[]>;

	/**
	 * Find one record.
	 * @param {string} id
	 * @return {Promise<JanuxPeople.Party>} Return the record, or a null value
	 * if there is no record given the id.
	 */
	findOne(id: string): Promise<JanuxPeople.Party>;

	/**
	 * Find several record given the ids.
	 * @param {string[]} ids
	 * @return {Promise<JanuxPeople.Party[]>} Return the parties founded. If there are no records
	 * founded then the method returns an empty array.
	 */
	findByIds(ids: string[]): Promise<JanuxPeople.Party[]>;

	/**
	 * Validate in an object has correct values. For example email regexp validation.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<ValidationError>} Return an array with the founded errors. If there is no
	 * error then the method return an empty array.
	 */
	validate(party: JanuxPeople.Party): ValidationError[];

	/**
	 * Insert a record.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<JanuxPeople.Party[]>} Return and instance with the id.
	 * Returns a reject if there are validation errors.
	 */
	insert(party: JanuxPeople.Party): Promise<JanuxPeople.Party>;

	/**
	 * Insert many records.
	 * @param {Party[]} parties
	 * @return {Bluebird<Party[]>}
	 */
	insertMany(parties: JanuxPeople.Party[]): Promise<JanuxPeople.Party[]>;

	/**
	 * Update a record.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<JanuxPeople.Party[]>} Return and instance with the id.
	 * Returns a reject if there are validation errors.
	 */
	update(party: JanuxPeople.Party): Promise<JanuxPeople.Party>;

	/**
	 * Remove an object.
	 * @param {string} id The id of the object to remove.
	 * @return {Promise<>} A promise indicating the object was removed.
	 * Returns a reject if the ir no object given the id.
	 */
	remove(id: string): Promise<any>;

	/**
	 * Remove several objects.
	 * @param {string[]} id
	 * @return {Promise<any>}
	 */
	removeByIds(id: string[]): Promise<any>;

	// Util methods.

	/**
	 * Convert a party instance to a JSON object
	 * @param {Party} party
	 * @return {any}
	 */
	toJSON(party: JanuxPeople.Party): any;

	/**
	 * Convert a object to a party instance.
	 * @param object
	 * @return {Party}
	 */
	fromJSON(object: any): JanuxPeople.Party;
}
