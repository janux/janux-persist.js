/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import {DbAdapter} from "../../persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "../../persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {EntityPropertiesImpl} from "../../persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {GroupEntity} from "./group-entity";
import {GroupValidator} from "./group-validator";

export class GroupDao extends AbstractDataAccessObjectWithAdapter<GroupEntity, string> {

    constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
        super(dbAdapter, entityProperties);
    }

    protected validateEntity(objectToValidate: GroupEntity): ValidationErrorImpl[] {
        return GroupValidator.validate(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: GroupEntity): Promise<ValidationErrorImpl[]> {
        return null;
    }

    protected validateBeforeUpdate(objectToUpdate: GroupEntity): Promise<ValidationErrorImpl[]> {
        return null;
    }
}
