/**
 * Project glarus-services
 * Created by ernesto on 1/3/18.
 */
import Promise = require("bluebird");
import { BigDecimalEntity } from "example/big-decimal/big-decimal-entity";
import { DbAdapter } from "persistence/api/db-adapters/db-adapter";
import { AbstractDataAccessObjectWithAdapter } from "persistence/implementations/dao/abstract-data-access-object-with-adapter";
import { EntityPropertiesImpl } from "persistence/implementations/dao/entity-properties";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";

export abstract class BigDecimalDao extends AbstractDataAccessObjectWithAdapter<BigDecimalEntity, string> {
	constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	protected validateEntity(objectToValidate: BigDecimalEntity): ValidationErrorImpl[] {
		return [];
	}

	protected validateBeforeInsert(objectToInsert: BigDecimalEntity): Promise<ValidationErrorImpl[]> {
		return Promise.resolve([]);
	}

	protected validateBeforeUpdate(objectToUpdate: BigDecimalEntity): Promise<ValidationErrorImpl[]> {
		return Promise.resolve([]);
	}
}
