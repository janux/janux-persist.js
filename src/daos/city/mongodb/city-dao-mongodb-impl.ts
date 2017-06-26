/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import * as Promise from "bluebird";
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {MongoDbUtil} from "../../../persistence/util/mongodb-util.js";
import {CityDao} from "../city-dao";
import {CityEntity} from "../city-entity";

export class CityDaoMongoDbImpl extends CityDao {

    private model: Model<any>;

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    protected validateBeforeUpdate<t>(objectToUpdate: CityEntity): Promise<IValidationError[]> {
        const query = {
            $and: [
                {_id: {$ne: objectToUpdate.id}},
                {code: {$eq: objectToUpdate.code}},
                {idStateProvince: {$eq: objectToUpdate.idStateProvince}},
            ]
        };
        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((result) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        "code",
                        "There is a city with the same code an state province id",
                        objectToUpdate.code));
                }
                return Promise.resolve(errors);
            });
    }
}
