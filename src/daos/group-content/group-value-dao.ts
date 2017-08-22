/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import {EntityPropertiesImpl} from "../../index";
import {DbAdapter} from "../../persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "../../persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {GroupValueEntity} from "./group-value-entity";
import {GroupValueValidator} from "./group-value-validator";

export class GroupValueDao extends AbstractDataAccessObjectWithAdapter<GroupValueEntity, string> {

    constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
        super(dbAdapter, entityProperties);
    }

    public findByIdGroup(idGroup: string): Promise<GroupValueEntity[]> {
        return this.findByAttribute('idGroup', idGroup);
    }

    public findByIdGroupAndValue(idGroup: string, value: any): Promise<GroupValueEntity[]> {
        const query = {
            $and: [
                {idGroup: {$eq: idGroup}},
                {value: {$eq: value}}
            ]
        };
        return this.findByQuery(query);
    }

    public removeAllByIdGroup(idGroup: string): Promise<any> {
        return this.findByIdGroup(idGroup)
            .then((resultQuery: GroupValueEntity[]) => {
                const ids: string[] = resultQuery.map((value) => value[this.ID_REFERENCE]);
                return this.removeByIds(ids);
            });
    }

    protected validateEntity(objectToValidate: GroupValueEntity): ValidationErrorImpl[] {
        return GroupValueValidator.validate(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: GroupValueEntity): Promise<ValidationErrorImpl[]> {
        return Promise.resolve([]);
    }

    protected validateBeforeUpdate(objectToUpdate: GroupValueEntity): Promise<ValidationErrorImpl[]> {
        const error: ValidationErrorImpl[] = [];
        error.push(new ValidationErrorImpl("update", GroupValueValidator.CANT_UPDATE, ""));
        return Promise.resolve(error);
    }
}
