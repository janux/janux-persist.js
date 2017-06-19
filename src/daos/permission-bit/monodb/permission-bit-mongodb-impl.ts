/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */

import * as Promise from "bluebird";
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {MongoDbUtil} from "../../../persistence/util/mongodb-util.js";
import {PermissionBitDao} from "../permission-bit-dao";
import {PermissionBitEntity} from "../permission-bit-entity";

export class PermissionBitMongodbImpl extends PermissionBitDao {

    private model: Model<any>;

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    protected validateBeforeUpdate<t>(objectToUpdate: PermissionBitEntity): Promise<IValidationError[]> {
        const id = "id";
        const query = {
            $and: [
                {_id: {$ne: objectToUpdate[id]}},
                {name: {$eq: objectToUpdate.name}},
                {idAuthContext: {$eq: objectToUpdate.idAuthContext}}
            ]
        };
        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((result: PermissionBitEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        "name",
                        "There is a permission bit with the same name and the same auth context",
                        objectToUpdate.name));
                }
                return Promise.resolve(errors);
            });
    }
}
