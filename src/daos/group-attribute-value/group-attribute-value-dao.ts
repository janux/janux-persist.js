/**
 * Project
 * Created by ernesto on 8/28/17.
 */
import * as Promise from 'bluebird';
import * as logger from 'log4js';
import {DbAdapter} from "../../persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "../../persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {EntityPropertiesImpl} from "../../persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {GroupAttributeValueValidator} from "./group-atribute-value-validator";
import {GroupAttributeValueEntity} from "./group-attribute-value";

export class GroupAttributeValueDao extends AbstractDataAccessObjectWithAdapter<GroupAttributeValueEntity, string> {

	private log = logger.getLogger("GroupAttributeValueDao");

	constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	/**
	 * Find all attributes that belongs to a group.
	 * @param {string} idGroup
	 * @return {Bluebird<GroupAttributeValueEntity[]>}
	 */
	public findByIdGroup(idGroup: string): Promise<GroupAttributeValueEntity[]> {
		return this.findByAttribute("idGroup", idGroup);
	}

	/**
	 * Find all attributes that belongs to several groups.
	 * @param {string[]} idGroups
	 * @return {Bluebird<GroupAttributeValueEntity[]>}
	 */
	public findByIdsGroupIn(idGroups: string[]): Promise<GroupAttributeValueEntity[]> {
		return this.findByAttributeNameIn("idGroup", idGroups);
	}

	/**
	 * Find all record with the same idGroup and key.
	 * @param {string} idGroup
	 * @param {string} key
	 * @return {Bluebird<GroupAttributeValueEntity[]>}
	 */
	public findByIdGroupAndKey(idGroup: string, key: string): Promise<GroupAttributeValueEntity[]> {
		this.log.debug("Call to findByIdGroupAndKey with idGroup %j , key: %j", idGroup, key);
		const query = {
			$and: [
				{idGroup: {$eq: idGroup}},
				{key: {$eq: key}}
			]
		};
		return this.findByQuery(query);
	}

	/**
	 * Find all group whose ids belongs to idGroups and the records contains the keyValues pair.
	 * @param {string[]} idGroups The idGroups to look for.
	 * @param {{}} keyValues The key-values to match. If keyValues is null or empty then the method
	 * only filters the data by idGroups.
	 */
	public findByIdGroupsAndKeyValuesMatch(idGroups: string[], keyValues: {}) {
		this.log.debug("Call to findByIdGroupsAndKeyValuesMatch with idGroups %j, keyValues: %j", idGroups, keyValues);
		let query: {};
		const subQueries = [];
		for (const key in keyValues) {
			const value = keyValues[key];
			subQueries.push({
				$and: [
					{key: {$eq: key}},
					{value: {$eq: value}}
				]
			});
		}
		if (subQueries.length === 0) {
			query = {idGroup: {$in: idGroups}};
		} else {
			query = {
				$and: [
					{idGroup: {$in: idGroups}},
					{$or: subQueries}
				]
			};
		}
		return this.findByQuery(query);
	}

	public removeAllByIdGroup(idGroup: string): Promise<any> {
		return this.findByIdGroup(idGroup)
			.then((resultQuery: GroupAttributeValueEntity[]) => {
				const ids: string[] = resultQuery.map((value) => value[this.ID_REFERENCE]);
				return this.removeByIds(ids);
			});
	}

	protected validateEntity(objectToValidate: GroupAttributeValueEntity): ValidationErrorImpl[] {
		return GroupAttributeValueValidator.validate(objectToValidate);
	}

	protected validateBeforeInsert(objectToInsert: GroupAttributeValueEntity): Promise<ValidationErrorImpl[]> {
		return this.findByIdGroupAndKey(objectToInsert.idGroup, objectToInsert.key)
			.then((resultQuery: GroupAttributeValueEntity[]) => {
				return this.validateDuplicated(resultQuery);
			});

	}

	protected validateBeforeUpdate(objectToUpdate: GroupAttributeValueEntity): Promise<ValidationErrorImpl[]> {
		const query = {
			$and: [
				{id: {$ne: objectToUpdate.id}},
				{idGroup: {$eq: objectToUpdate.idGroup}},
				{key: {$eq: objectToUpdate.key}}
			]
		};
		return this.findByQuery(query)
			.then((resultQuery: GroupAttributeValueEntity[]) => {
				return this.validateDuplicated(resultQuery);
			});
	}

	private validateDuplicated(resultQuery: GroupAttributeValueEntity[]): Promise<ValidationErrorImpl[]> {
		this.log.debug("Call to validateDuplicated with %j", resultQuery);
		const errors: ValidationErrorImpl[] = [];
		if (resultQuery.length > 0) {
			errors.push(new ValidationErrorImpl(
				GroupAttributeValueValidator.KEY,
				GroupAttributeValueValidator.DUPLICATED_KEY,
				[resultQuery[0].idGroup, resultQuery[0].key].toString()));
		}
		return Promise.resolve(errors);
	}
}
