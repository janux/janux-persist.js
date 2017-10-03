/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import {DbAdapter} from "persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {EntityPropertiesImpl} from "../../index";
import {GroupContentEntity} from "./group-content-entity";
import {GroupContentValidator} from "./group-content-validator";

export class GroupContentDao extends AbstractDataAccessObjectWithAdapter<GroupContentEntity, string> {

	constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	public findByIdGroup(idGroup: string): Promise<GroupContentEntity[]> {
		return this.findByAttribute('idGroup', idGroup);
	}

	public findByIdGroupsIn(idGroups: string[]): Promise<GroupContentEntity[]> {
		return this.findByAttributeNameIn('idGroup', idGroups);
	}

	public findByIdGroupAndValue(idGroup: string, value: any): Promise<GroupContentEntity[]> {
		const query = {
			$and: [
				{idGroup: {$eq: idGroup}},
				{value: {$eq: value}}
			]
		};
		return this.findByQuery(query);
	}

	/**
	 * Return all records given a value and a list of idGroups.
	 * @param {string[]} idGroups
	 * @param value
	 * @return {Bluebird<GroupContentEntity[]>}
	 */
	public findByIdGroupsInAndValue(idGroups: string[], value: any): Promise<GroupContentEntity[]> {
		const query = {
			$and: [
				{idGroup: {$in: idGroups}},
				{value: {$eq: value}}
			]
		};
		return this.findByQuery(query);
	}

	public removeAllByIdGroup(idGroup: string): Promise<any> {
		return this.findByIdGroup(idGroup)
			.then((resultQuery: GroupContentEntity[]) => {
				const ids: string[] = resultQuery.map((value) => value[this.ID_REFERENCE]);
				return this.removeByIds(ids);
			});
	}

	protected validateEntity(objectToValidate: GroupContentEntity): ValidationErrorImpl[] {
		return GroupContentValidator.validate(objectToValidate);
	}

	protected validateBeforeInsert(objectToInsert: GroupContentEntity): Promise<ValidationErrorImpl[]> {
		return this.findByIdGroupAndValue(objectToInsert.idGroup, objectToInsert.value)
			.then((resultQuery: GroupContentEntity[]) => {
				const errors: ValidationErrorImpl[] = [];
				if (resultQuery.length > 0) {
					errors.push(new ValidationErrorImpl(
						GroupContentValidator.OBJECT_GROUP,
						GroupContentValidator.OBJECT_GROUP_DUPLICATED,
						objectToInsert.value.toString()
					));
				}
				return Promise.resolve(errors);
			});
	}

	protected validateBeforeUpdate(objectToUpdate: GroupContentEntity): Promise<ValidationErrorImpl[]> {
		const error: ValidationErrorImpl[] = [];
		error.push(new ValidationErrorImpl("update", GroupContentValidator.CANT_UPDATE, ""));
		return Promise.resolve(error);
	}
}
