/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import {EntityPropertiesImpl} from "../../../dist/persistence/implementations/dao/entity-properties";
import {DbAdapter} from "../../persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "../../persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {GroupEntity} from "./group-entity";
import {GroupValidator} from "./group-validator";

export class GroupDao extends AbstractDataAccessObjectWithAdapter<GroupEntity, string> {

    public readonly CODE = "CODE";
    public readonly CODE_DUPLICATED = "There is a record with the same code";

    constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
        super(dbAdapter, entityProperties);
    }

    public findOneByCode(code: string) {
        return this.findOneByAttribute(this.CODE, code);
    }

    protected validateEntity(objectToValidate: GroupEntity): ValidationErrorImpl[] {
        return GroupValidator.validate(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: GroupEntity): Promise<ValidationErrorImpl[]> {
        return this.findOneByCode(objectToInsert.code)
            .then((resultQuery: GroupEntity) => {
                const errors: ValidationErrorImpl[] = [];
                if (resultQuery != null) {
                    errors.push(new ValidationErrorImpl(this.CODE, this.CODE_DUPLICATED, objectToInsert.code));
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
                    errors.push(new ValidationErrorImpl(this.CODE, this.CODE_DUPLICATED, objectToUpdate.code));
                }
                return Promise.resolve(errors);
            });
    }
}
