/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import JanuxPeople = require("janux-people");
import * as _ from "lodash";
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {LokiJsAdapter} from "persistence/implementations/db-adapters/lokijs-db-adapter";
import {isBlankString} from "utils/string/blank-string-validator";
import {PartyDao} from "../party-dao";
import {PartyValidator} from "../party-validator";

/**
 * Implementation PartyDao for the lokijs database.
 */
export class PartyDaoLokiJsImpl extends PartyDao {

	constructor(dbAdapter: LokiJsAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	/**
	 * Find all record that matches with the name.
	 * @param name the name to look for.
	 * @return {Promise<(JanuxPeople.Person|JanuxPeople.Organization)[]>} The parties that matches with the name.
	 */
	public findByName(name: string): Promise<JanuxPeople.PartyAbstract[]> {
		const query = {
			$or: [
				{
					$and: [
						{
							$or: [
								{'name.first': {$contains: name}},
								{'name.middle': {$contains: name}},
								{'name.last': {$contains: name}}
							]
						},
						{typeName: {$eq: PartyValidator.PERSON}}
					]
				},
				{
					$and: [
						{name: {$contains: name}},
						{typeName: {$eq: PartyValidator.ORGANIZATION}}
					]
				}
			]
		};
		return this.findByQuery(query);
	}

	/**
	 * Validate the object before updateMethod to the database.
	 * @param objectToUpdate
	 * @return {Promise<ValidationErrorImpl[]>}
	 */
	protected validateBeforeUpdate(objectToUpdate: JanuxPeople.PartyAbstract): Promise<ValidationErrorImpl[]> {
		return this.validateDuplicated(objectToUpdate);
	}

	private validateDuplicated(objectToUpdate: JanuxPeople.PartyAbstract): Promise<ValidationErrorImpl[]> {
		let emailAddressesToLookFor: string[];
		emailAddressesToLookFor = objectToUpdate.emailAddresses(false).map((value, index, array) => value.address);
		let personReference: JanuxPeople.Person;
		let organizationReference: JanuxPeople.Organization;
		let query: any;

		if (objectToUpdate.typeName === PartyValidator.PERSON) {
			personReference = objectToUpdate as JanuxPeople.Person;
			query = {
				$and: [
					{id: {$ne: objectToUpdate[this.ID_REFERENCE]}},
					{
						$or: [
							{"emails.address": {$in: emailAddressesToLookFor}}
							// {
							// 	$and: [
							// 		{"name.first": {$eq: personReference.name.first}},
							// 		{"name.middle": {$eq: personReference.name.middle}},
							// 	]
							// }
						]
					}
				]
			};

			// if (isBlankString(personReference.name.last) === false) {
			// query.$and[1].$or[1].$and.push({"name.last": {$eq: personReference.name.last}});
			// }
		} else {
			organizationReference = objectToUpdate as JanuxPeople.Organization;
			query = {
				$and: [
					{id: {$ne: objectToUpdate[this.ID_REFERENCE]}},
					{
						$or: [
							{"emails.address": {$in: emailAddressesToLookFor}},
							{name: {$eq: organizationReference.name}}
						]
					}
				]
			};
		}

		return this.findByQuery(query)
		.then((resultQuery: JanuxPeople.PartyAbstract[]) => {
			const errors: ValidationErrorImpl[] = PartyValidator.validateDuplicatedRecords(resultQuery, emailAddressesToLookFor, objectToUpdate);
			return Promise.resolve(errors);
		});

		// return Promise.resolve([]);
	}

}
