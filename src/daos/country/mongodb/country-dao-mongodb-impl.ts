/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as Promise from "bluebird";
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {MongoDbUtil} from "../../../persistence/util/mongodb-util.js";
import {CountryDao} from "../country-dao";
import {CountryEntity} from "../country-entity";

export class CountryDaoMongoDbImpl extends CountryDao {

    private model: Model<any>;

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    protected validateBeforeUpdate(objectToUpdate: CountryEntity): Promise<IValidationError[]> {
        const id = "id";

        const query = {
            $and: [
                {_id: {$ne: objectToUpdate[id]}},
                {
                    $or: [
                        {name: {$eq: objectToUpdate.name}},
                        {isoCode: {$eq: objectToUpdate.isoCode}}
                    ]
                }
            ]
        };

        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((result: CountryEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    if (result[0].name === objectToUpdate.name) {
                        errors.push(new ValidationError(
                            "name",
                            "There is another country with the same name",
                            objectToUpdate.name));
                    } else {
                        errors.push(new ValidationError(
                            "isoCode",
                            "There is another country with the same ISO code",
                            objectToUpdate.isoCode));
                    }
                }
                return Promise.resolve(errors);
            });
    }
}
