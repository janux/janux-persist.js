/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import JanuxPeople = require("janux-people");
import * as _ from "lodash";
import { Model } from "mongoose";
import { EntityPropertiesImpl } from "persistence/implementations/dao/entity-properties";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import { MongooseAdapter } from "persistence/implementations/db-adapters/mongoose-db-adapter";
import { PartyDao } from "../party-dao";
import { PartyValidator } from "../party-validator";

/**
 * Implementation of the PartyDao for the mongoose library.
 */
export class PartyDaoMongooseImpl extends PartyDao {
	private model: Model<any>;

	constructor(dbEngineUtil: MongooseAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbEngineUtil, entityProperties);
		this.model = dbEngineUtil.model;
	}

	/**
	 * Find all records that matches with the name.
	 * @param {string} name
	 * @return {Promise<PartyAbstract[]>}
	 */
	public findByName(name: string): Promise<JanuxPeople.PartyAbstract[]> {
		const regexpName = new RegExp(name, "i");
		const query = {
			$or: [
				{
					$and: [
						{
							$or: [
								{ "name.first": regexpName },
								{ "name.middle": regexpName },
								{ "name.last": regexpName }
							]
						},
						{ typeName: { $eq: PartyValidator.PERSON } }
					]
				},
				{
					$and: [{ name: regexpName }, { typeName: { $eq: PartyValidator.ORGANIZATION } }]
				}
			]
		};
		return this.findByQuery(query);
	}

	findByIdsAndFunctionsProvided(ids: string[], functionsProvided: string[]): Promise<JanuxPeople.PartyAbstract[]> {
		const query = {
			$and: [
				{ id: { $in: ids } },
				{
					$or: _.map(functionsProvided, value => {
						return { functionsProvided: value };
					})
				}
			]
		};
		return this.findByQuery(query);
	}

	protected validateBeforeUpdate(objectToUpdate: JanuxPeople.PartyAbstract): Promise<ValidationErrorImpl[]> {
		return this.validateDuplicated(objectToUpdate);
	}

	protected validateDuplicated(objectToUpdate: JanuxPeople.PartyAbstract): Promise<ValidationErrorImpl[]> {
		const records = objectToUpdate.emailAddresses(false);
		let emailAddressesToLookFor: string[];
		if (records == null) {
			return Promise.resolve([]);
		}
		emailAddressesToLookFor = records.map(value => value.address);
		emailAddressesToLookFor = _.filter(emailAddressesToLookFor, value => value != null);
		if (emailAddressesToLookFor.length === 0) {
			return Promise.resolve([]);
		}
		let personReference: JanuxPeople.Person;
		let organizationReference: JanuxPeople.Organization;
		let query: any;

		if (objectToUpdate.typeName === PartyValidator.PERSON) {
			personReference = objectToUpdate as JanuxPeople.Person;
			query = {
				$and: [
					{ id: { $ne: objectToUpdate[this.ID_REFERENCE] } },
					{
						$or: [
							{ "emails.address": { $in: emailAddressesToLookFor } }
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
			// 	query.$and[1].$or[1].$and.push({"name.last": {$eq: personReference.name.last}});
			// }
		} else {
			organizationReference = objectToUpdate as JanuxPeople.Organization;
			query = {
				$and: [
					{ id: { $ne: objectToUpdate[this.ID_REFERENCE] } },
					{
						$or: [
							{ "emails.address": { $in: emailAddressesToLookFor } },
							{ name: { $eq: organizationReference.name } }
						]
					}
				]
			};
		}

		// if (_.isUndefined(objectToUpdate.idAccount) === false) {
		// 	query.$and[1].$or.push({idAccount: {$eq: objectToUpdate.idAccount}});
		// }

		return this.findByQuery(query).then((resultQuery: JanuxPeople.PartyAbstract[]) => {
			const errors: ValidationErrorImpl[] = PartyValidator.validateDuplicatedRecords(
				resultQuery,
				emailAddressesToLookFor,
				objectToUpdate
			);
			return Promise.resolve(errors);
		});

		// return Promise.resolve([]);
	}
}
