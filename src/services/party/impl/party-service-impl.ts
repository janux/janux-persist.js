/**
 * Project janux-persist.js
 * Created by ernesto on 11/9/17.
 */
import Promise = require("bluebird");
import {PartyDao} from "daos/party/party-dao";
import {PartyValidator} from "daos/party/party-validator";
import JanuxPeople = require("janux-people");
import {PartyAbstract} from "janux-people";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {PartyService} from "services/party/api/party-service";

export class PartyServiceImpl implements PartyService {

	public static readonly PERSON: string = "PersonImpl";
	public static readonly ORGANIZATION: string = "OrganizationImpl";
	private partyDao: PartyDao;

	constructor(partyDao: PartyDao) {
		this.partyDao = partyDao;
	}

	/**
	 * Find all record that matches with the name,
	 * @param {string} name
	 * @return {Promise}
	 */
	findByName(name: string): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByName(name);
	}

	/**
	 * Find all records that has the email address.
	 * @param {string} email
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findByEmail(email: string): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByEmail(email);
	}

	/**
	 * Find all records that hast the phone number.
	 * @param {string} phone
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findByPhone(phone: string): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByPhone(phone);
	}

	/**
	 * Find all people
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findPeople(): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findPeople();
	}

	/**
	 * Find all organizations
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findOrganizations(): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findOrganizations();
	}

	/**
	 * Validate in an object has correct values. For example email regexp validation.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<ValidationError>} Return an array with the founded errors. If there is no
	 * error then the method return an empty array.
	 */
	validate(party: JanuxPeople.PartyAbstract): ValidationErrorImpl[] {
		return PartyValidator.validateParty(party);
	}

	/**
	 * Find one record.
	 * @param {string} id
	 * @return {Promise<JanuxPeople.Party>} Return the record, or a null value
	 * if there is no record given the id.
	 */
	findOne(id: string): Promise<JanuxPeople.PartyAbstract> {
		return this.partyDao.findOne(id);
	}

	/**
	 * Find several record given the ids.
	 * @param {string[]} ids
	 * @return {Promise<JanuxPeople.Party[]>} Return the parties founded. If there are no records
	 * founded then the method returns an empty array.
	 */
	findByIds(ids: string[]): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByIds(ids);
	}

	/**
	 * Insert a record.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<JanuxPeople.Party[]>} Return and instance with the id.
	 * Returns a reject if there are validation errors.
	 */
	insert(party: JanuxPeople.PartyAbstract): Promise<JanuxPeople.PartyAbstract> {
		return this.partyDao.insert(party);
	}

	/**
	 * Update a record.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<JanuxPeople.Party[]>} Return and instance with the id.
	 * Returns a reject if there are validation errors.
	 */
	update(party: JanuxPeople.PartyAbstract): Promise<JanuxPeople.PartyAbstract> {
		return this.partyDao.update(party);
	}

	/**
	 * Remove an object.
	 * @param {string} id The id of the object to remove.
	 * @return {Promise<>} A promise indicating the object was removed.
	 * Returns a reject if the ir no object given the id.
	 */
	remove(id: string): Promise<any> {
		// TODO: Validate main relations.
		return this.partyDao.removeById(id);
	}

	/**
	 * Remove several objects.
	 * @param ids
	 * @return {Promise<any>}
	 */
	removeByIds(ids: string[]): Promise<any> {
		return this.partyDao.removeById(ids);
	}

	/**
	 * Convert a party instance to a JSON object
	 * @param {Party} party
	 * @return {any}
	 */
	toJSON(party: PartyAbstract): any {
		if (party == null) return party;
		const id = party['id'];
		const typeName = party.typeName;
		const result: any = party.toJSON();
		const dateCreated = party['dateCreated'];
		const lastUpdate = party['lastUpdate'];
		result.id = id;
		result.typeName = typeName;
		result.dateCreated = dateCreated;
		result.lastUpdate = lastUpdate;
		return result;
	}

	/**
	 * Convert a object to a party instance.
	 * @param object
	 * @return {Party}
	 */
	fromJSON(object: any): PartyAbstract {
		if (object == null) return object;
		const id = object.id;
		const typeName = object.typeName;
		const dateCreated = object.dateCreated;
		const lastUpdate = object.lastUpdate;
		let result: any;
		if (typeName === PartyServiceImpl.PERSON) {
			result = JanuxPeople.Person.fromJSON(object);
		} else {
			result = JanuxPeople.Organization.fromJSON(object);
		}
		result.id = id;
		result.dateCreated = dateCreated;
		result.lastUpdate = lastUpdate;
		return result;
	}
}
