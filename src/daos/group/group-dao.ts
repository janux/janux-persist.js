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

    public findOneByCode(code: string): Promise<GroupEntity> {
        return this.findOneByAttribute(GroupValidator.CODE, code);
    }

    public findByCodesIn(codes: string[]): Promise<GroupEntity[]> {
        return this.findByAttributeNameIn(GroupValidator.CODE, codes);
    }

    protected validateEntity(objectToValidate: GroupEntity): ValidationErrorImpl[] {
        return GroupValidator.validate(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: GroupEntity): Promise<ValidationErrorImpl[]> {
        return this.findOneByCode(objectToInsert.code)
            .then((resultQuery: GroupEntity) => {
                const errors: ValidationErrorImpl[] = [];
                if (resultQuery != null) {
                    errors.push(new ValidationErrorImpl(GroupValidator.CODE, GroupValidator.CODE_DUPLICATED, objectToInsert.code));
                }
                return Promise.resolve(errors);
            });
    }

    protected validateBeforeUpdate(objectToUpdate: GroupEntity): Promise<ValidationErrorImpl[]> {
        const query = {
            $and: [
                {id: {$ne: objectToUpdate[this.ID_REFERENCE]}},
                {code: {$eq: objectToUpdate.code}}
            ]
        };
        return this.findByQuery(query)
            .then((resultQuery: GroupEntity[]) => {
                const errors: ValidationErrorImpl[] = [];
                if (resultQuery.length > 0) {
                    errors.push(new ValidationErrorImpl(GroupValidator.CODE, GroupValidator.CODE_DUPLICATED, objectToUpdate.code));
                }
                return Promise.resolve(errors);
            });
    }
}
