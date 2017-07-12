/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import * as Bluebird from "bluebird";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {StateProvinceDao} from "../state-province-dao";
import {StateProvinceEntity} from "../state-province-entity";

export class StateProvinceDaoMongoDbImpl extends StateProvinceDao {

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    protected validateBeforeUpdate(objectToUpdate: StateProvinceEntity): Bluebird<IValidationError[]> {
        const query = {
            $and: [
                {_id: {$ne: objectToUpdate.id}},
                {code: {$eq: objectToUpdate.code}},
                {countryIsoCode: {$eq: objectToUpdate.countryIsoCode}},
            ]
        };
        return this.findAllByQuery(query)
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
