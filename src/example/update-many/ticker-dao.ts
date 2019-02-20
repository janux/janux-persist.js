/*
 * Project janux-persist.js
 * Created by ernesto on 2/19/19
 */
import * as Bluebird from "bluebird";
import { TickerEntity } from "example/update-many/ticker-entity";
import * as _ from "lodash";
import { DbAdapter } from "persistence/api/db-adapters/db-adapter";
import { AbstractDataAccessObjectWithAdapter } from "persistence/implementations/dao/abstract-data-access-object-with-adapter";
import { EntityPropertiesImpl } from "persistence/implementations/dao/entity-properties";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import { isBlankString } from "utils/string/blank-string-validator";

export class TickerDao extends AbstractDataAccessObjectWithAdapter<TickerEntity, string> {
	constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	public findOneByName(name: string): Bluebird<TickerEntity> {
		return this.findOneByAttribute("name", name);
	}

	protected validateEntity(objectToValidate: TickerEntity): ValidationErrorImpl[] {
		return isBlankString(objectToValidate.name) ? [new ValidationErrorImpl("name", "name empty", "")] : [];
	}

	protected validateBeforeInsert(objectToInsert: TickerEntity): Bluebird<ValidationErrorImpl[]> {
		return this.findOneByName(objectToInsert.name).then(value => {
			const errors: ValidationErrorImpl[] = [];
			if (!_.isNil(value)) {
				errors.push(new ValidationErrorImpl("name", "name duplicated", objectToInsert.name));
			}
			return Bluebird.resolve(errors);
		});
	}

	protected validateBeforeUpdate(objectToUpdate: TickerEntity): Bluebird<ValidationErrorImpl[]> {
		const query = {
			id: { $ne: objectToUpdate.id },
			name: objectToUpdate.name
		};
		return this.findByQuery(query).then((value: TickerEntity[]) => {
			const errors: ValidationErrorImpl[] = [];
			if (value.length > 0) {
				errors.push(new ValidationErrorImpl("name", "name duplicated", value[0].name));
			}
			return Bluebird.resolve(errors);
		});
	}

	protected validateBeforeUpdateMany(objectToUpdate: TickerEntity[]): Bluebird<ValidationErrorImpl[]> {
		// Validate in the array for duplicated values.
		const uniqueValues = _.uniqBy(objectToUpdate, value => value.name);
		if (uniqueValues.length !== objectToUpdate.length) {
			return Bluebird.reject([new ValidationErrorImpl("name", "name duplicated in array", "")]);
		}
		const query = {
			id: { $nin: objectToUpdate.map(value => value.id) },
			name: { $in: objectToUpdate.map(value => value.name) }
		};
		return this.findByQuery(query).then((value: TickerEntity[]) => {
			const errors: ValidationErrorImpl[] = [];
			if (value.length > 0) {
				errors.push(new ValidationErrorImpl("name", "name duplicated", value[0].name));
			}
			return Bluebird.resolve(errors);
		});
	}
}
