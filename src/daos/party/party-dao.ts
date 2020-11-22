/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import { StaffImplTest } from "example/people-extends/staff-imp-test";
import JanuxPeople = require("janux-people");
import * as _ from "lodash";
import { DbAdapter } from "persistence/api/db-adapters/db-adapter";
import { AbstractDataAccessObjectWithAdapter } from "persistence/implementations/dao/abstract-data-access-object-with-adapter";
import { EntityPropertiesImpl } from "persistence/implementations/dao/entity-properties";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import * as logger from "utils/logger-api/logger-api";
import { PartyValidator } from "./party-validator";

/**
 * This is the base class of the partyDao. In this class we define the object we are going to use
 *  is JanuxPeople.Person or JanuxPeople.Organization.
 */
export abstract class PartyDao extends AbstractDataAccessObjectWithAdapter<JanuxPeople.PartyAbstract, string> {
	private partyDaoLogger = logger.getLogger("PartyDao");

	constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	public abstract findByIdsAndFunctionsProvided(
		ids: string[],
		functionsProvided: string[]
	): Promise<JanuxPeople.PartyAbstract[]>;

	/**
	 * Find all record that matches with the name,
	 * Because this method handles complex queries. This method must be implement per each db engine.
	 * @param name The name to look for.
	 * @return A list of parties that matches with the name.
	 */
	public abstract findByName(name: string): Promise<JanuxPeople.PartyAbstract[]>;

	/**
	 * Find all records that has the email address.
	 * @param {string} email
	 * @return {Promise<JanuxPeople.PartyAbstract[]>}
	 */
	public findByEmail(email: string): Promise<JanuxPeople.PartyAbstract[]> {
		return this.findByAttribute("emails.address", email);
	}

	/**
	 * Find all records that hast the phone number.
	 * @param {string} phone
	 * @return {Promise<JanuxPeople.PartyAbstract[]>}
	 */
	public findByPhone(phone: string): Promise<JanuxPeople.PartyAbstract[]> {
		return this.findByAttribute("phones.number", phone);
	}

	/**
	 * Find all people
	 * @return {Promise<JanuxPeople.PartyAbstract[]>}
	 */
	public findPeople(): Promise<JanuxPeople.PartyAbstract[]> {
		return this.findByAttribute("typeName", PartyValidator.PERSON);
	}

	/**
	 * Find all people by Period
	 * @param object
	 * @return {Promise<JanuxPeople.PartyAbstract[]>}
	 */
	public findPeopleByPeriod(object: any): Promise<JanuxPeople.PartyAbstract[]> {
		const query = {
			$and: [
				{
					$or: [
						{
							dateCreated: {
								$gte: new Date(object.from),
								$lte: new Date(object.to)
							}
						},
						{
							lastUpdate: {
								$gte: new Date(object.from),
								$lte: new Date(object.to)
							}
						}
					]
				},
				{
					typeName: { $eq : 'PersonImpl' }
				}
			]
		  };
		return this.findByQuery(query);
	}

	/**
	 * Find all organizations
	 * @return {Promise<JanuxPeople.PartyAbstract[]>}
	 */
	public findOrganizations(): Promise<JanuxPeople.PartyAbstract[]> {
		return this.findByAttribute("typeName", PartyValidator.ORGANIZATION);
	}

	/**
	 * Find all parties given the isSupplier flag and typeName.
	 * @param {boolean} isSupplier
	 * @param typeName Optional value. If defined the method filter by this criteria.
	 * @return {Bluebird<PartyAbstract[]>}
	 */
	public findByIsSupplierAndTypeName(isSupplier: boolean, typeName?: string): Promise<JanuxPeople.PartyAbstract[]> {
		let query: {};
		if (typeName == null) {
			query = {
				$and: [{ isSupplier: { $eq: isSupplier } }]
			};
		} else {
			query = {
				$and: [{ isSupplier: { $eq: isSupplier } }, { typeName: { $eq: typeName } }]
			};
		}

		return this.findByQuery(query);
	}

	/**
	 * Implementation of the method validateEntity.
	 * @param {JanuxPeople.PartyAbstract} objectToValidate
	 * @return {ValidationErrorImpl[]}
	 */
	protected validateEntity<t>(objectToValidate: JanuxPeople.PartyAbstract): ValidationErrorImpl[] {
		return PartyValidator.validateParty(objectToValidate);
	}

	/**
	 * Validate the record is valid before inserting to the database.
	 * @param {JanuxPeople.PartyAbstract} objectToInsert
	 * @return {Promise<ValidationErrorImpl[]>}
	 */
	protected validateBeforeInsert(objectToInsert: JanuxPeople.PartyAbstract): Promise<ValidationErrorImpl[]> {
		let emailAddressesToLookFor: string[];
		// let personReference: JanuxPeople.Person;
		let organizationReference: JanuxPeople.Organization;
		let query: any;
		emailAddressesToLookFor = objectToInsert.emailAddresses(false).map(value => value.address);
		// TODO fix this hack.
		emailAddressesToLookFor = _.filter(emailAddressesToLookFor, value => value != null);
		if (emailAddressesToLookFor.length === 0) {
			return Promise.resolve([]);
		}
		if (objectToInsert.typeName === PartyValidator.PERSON) {
			// personReference = objectToInsert as JanuxPeople.Person;
			query = {
				$or: [{ "emails.address": { $in: emailAddressesToLookFor } }]
			};
		} else {
			organizationReference = objectToInsert as JanuxPeople.Organization;
			query = {
				$or: [
					{ "emails.address": { $in: emailAddressesToLookFor } },
					{ name: { $eq: organizationReference.name } }
				]
			};
		}

		return this.findByQuery(query).then((resultQuery: JanuxPeople.PartyAbstract[]) => {
			const errors: ValidationErrorImpl[] = PartyValidator.validateDuplicatedRecords(
				resultQuery,
				emailAddressesToLookFor,
				objectToInsert
			);
			return Promise.resolve(errors);
		});
		// return Promise.resolve([]);
	}

	/**
	 * Transforms the object before inserting or updating the database.
	 * In this case JanuxPeople.Person JanuxPeople.Organization has a method called toJSON.
	 * We are going to use this method.
	 * @param object The object to transforms.
	 * @return {any} the transformed object.
	 */
	protected convertBeforeSave(object: JanuxPeople.PartyAbstract): any {
		this.partyDaoLogger.debug("Call to convertBeforeSave with object: %j ", object);
		let result: any = object.toJSON();

		// For some reason , PersonImpl an OrganizationImpl has circular references. In order to remove the circular
		// references we do JSON.parse(JSON.stringify(object)). With this we avoid to crash mongoose.
		result = JSON.parse(JSON.stringify(result));
		result.typeName = object.typeName;
		result.isSupplier = object["isSupplier"];
		result.isReseller = object["isReseller"];
		result.typeName = object.typeName;
		result.functionsProvided = object["functionsProvided"];
		result.functionsReceived = object["functionsReceived"];
		result.taxIdentificationCode = object["taxIdentificationCode"];
		this.partyDaoLogger.debug("Returning %j", result);
		return result;
	}

	/**
	 * Convert the object to a JanuxPeople.Person or a JanuxPeople.Organization.
	 * @param object The data retrieved form the database.
	 * @return {any} Ans instance of JanuxPeople.Person or JanuxPeople.Organization.
	 */
	protected convertAfterDbOperation(object: any): JanuxPeople.PartyAbstract {
		let result: any;
		if (object.typeName === PartyValidator.PERSON) {
			result = JanuxPeople.Person.fromJSON(object);
		} else if (object.typeName === PartyValidator.ORGANIZATION) {
			result = JanuxPeople.Organization.fromJSON(object);
		} else if (object.typeName === PartyValidator.STAFF) {
			result = StaffImplTest.fromJSON(object);
		}
		result.id = object.id;
		result.isReseller = object.isReseller;
		result.isSupplier = object.isSupplier;
		result.functionsProvided = object.functionsProvided;
		result.functionsReceived = object.functionsReceived;
		result.taxIdentificationCode = object.taxIdentificationCode;
		return result;
	}
}
