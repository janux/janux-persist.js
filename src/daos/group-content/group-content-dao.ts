/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import {EntityPropertiesImpl} from "../../index";
import {DbAdapter} from "../../persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "../../persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {GroupContentEntity} from "./group-content-entity";
import {GroupContentValidator} from "./group-content-validator";

export class GroupContentDao extends AbstractDataAccessObjectWithAdapter<GroupContentEntity, string> {

    constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
        super(dbAdapter, entityProperties);
    }

    public findByIdGroup(idGroup: string): Promise<GroupContentEntity[]> {
        return this.findByAttribute('idGroup', idGroup);
    }

    public deleteAllByIdGroup(idGroup: string): Promise<any> {
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
        return super.validateBeforeInsert(objectToInsert);
    }

    protected validateBeforeUpdate(objectToUpdate: GroupContentEntity): Promise<ValidationErrorImpl[]> {
        return super.validateBeforeUpdate(objectToUpdate);
    }
}
