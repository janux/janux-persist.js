/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import * as Bluebird from "bluebird";
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {MongoDbUtil} from "../../../persistence/util/mongodb-util.js";
import {StateProvinceDao} from "../state-province-dao";
import {StateProvinceEntity} from "../state-province-entity";

export class StateProvinceDaoMongoDbImpl extends StateProvinceDao {

    private model: Model<any>;

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    protected validateBeforeUpdate(objectToUpdate: StateProvinceEntity): Bluebird<IValidationError[]> {
        const id = "id";
        const query = {
            $and: [
                {_id: {$ne: objectToUpdate[id]}},
                {code: {$eq: objectToUpdate.code}},
                {idCountry: {$eq: objectToUpdate.idCountry}},
            ]
        };
        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((result: StateProvinceEntity[]) => {
                const error: ValidationError[] = [];
                if (result.length > 0) {
                    error.push(new ValidationError(
                        "code",
                        "There is another state province with the same code and the same country",
                        objectToUpdate.code));
                }
                return Bluebird.resolve(error);
            });
    }
}
