/**
 * Project janux-persist.js
 * Created by ernesto on 11/9/17.
 */
import Bluebird = require("bluebird");
import {PartyDao} from "daos/party/party-dao";
import {PartyValidator} from "daos/party/party-validator";
import JanuxPeople = require("janux-people");
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {PartyService} from "services/party/api/party-service";

export class PartyServiceImpl implements PartyService {

	private partyDao: PartyDao;

	constructor(partyDao: PartyDao) {
		this.partyDao = partyDao;
	}

	/**
	 * Find all record that matches with the name,
	 * @param {string} name
	 * @return {Promise}
	 */
	findByName(name: string): Bluebird<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByName(name);
	}

	/**
	 * Find all records that has the email address.
	 * @param {string} email
	 * @return {Bluebird<JanuxPeople.Party[]>}
	 */
	findByEmail(email: string): Bluebird<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByEmail(email);
	}

	/**
	 * Find all records that hast the phone number.
	 * @param {string} phone
	 * @return {Bluebird<JanuxPeople.Party[]>}
	 */
	findByPhone(phone: string): Bluebird<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByPhone(phone);
	}

	/**
	 * Find all people
	 * @return {Bluebird<JanuxPeople.Party[]>}
	 */
	findPeople(): Bluebird<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findPeople();
	}

	/**
	 * Find all organizations
	 * @return {Bluebird<JanuxPeople.Party[]>}
	 */
	findOrganizations(): Bluebird<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findOrganizations();
	}

	/**
	 * Validate in an object has correct values. For example email regexp validation.
	 * @param {JanuxPeople.Party} party
	 * @return {Bluebird<ValidationError>} Return an array with the founded errors. If there is no
	 * error then the method return an empty array.
	 */
	validate(party: JanuxPeople.Party): ValidationErrorImpl[] {
		return PartyValidator.validateParty(party);
	}

	/**
	 * Find one record.
	 * @param {string} id
	 * @return {Bluebird<JanuxPeople.Party>} Return the record, or a null value
	 * if there is no record given the id.
	 */
	findOne(id: string): Bluebird<JanuxPeople.PartyAbstract> {
		return this.partyDao.findOne(id);
	}

	/**
	 * Find several record given the ids.
	 * @param {string[]} ids
	 * @return {Bluebird<JanuxPeople.Party[]>} Return the parties founded. If there are no records
	 * founded then the method returns an empty array.
	 */
	findByIds(ids: string[]): Bluebird<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByIds(ids);
	}

	/**
	 * Insert a record.
	 * @param {JanuxPeople.Party} party
	 * @return {Bluebird<JanuxPeople.Party[]>} Return and instance with the id.
	 * Returns a reject if there are validation errors.
	 */
	insert(party: JanuxPeople.PartyAbstract): Bluebird<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.insert(party);
	}

	/**
	 * Update a record.
	 * @param {JanuxPeople.Party} party
	 * @return {Bluebird<JanuxPeople.Party[]>} Return and instance with the id.
	 * Returns a reject if there are validation errors.
	 */
	update(party: JanuxPeople.PartyAbstract): Bluebird<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.update(party);
	}

	/**
	 * Remove an object.
	 * @param {string} id The id of the object to remove.
	 * @return {Bluebird<>} A promise indicating the object was removed.
	 * Returns a reject if the ir no object given the id.
	 */
	remove(id: string): Bluebird<any> {
		return this.partyDao.removeById(id);
	}

	/**
	 * Remove several objects.
	 * @param {string[]} id
	 * @return {Bluebird<any>}
	 */
	removeByIds(ids: string[]): Bluebird<any> {
		return this.partyDao.removeById(ids);
	}
}
