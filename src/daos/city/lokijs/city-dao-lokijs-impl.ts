/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {CityDao} from "../city-dao";
import {CityEntity} from "../city-entity";

export class CityDaoLokiJsImpl extends CityDao {

    private collection: any;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.collection = dbEngineUtil.collection;
    }

    protected validateBeforeUpdate<t>(objectToUpdate: CityEntity): Promise<IValidationError[]> {
        const query = {
            $and: [
                {$loki: {$ne: _.toNumber(objectToUpdate.id)}},
                {code: {$eq: objectToUpdate.code}},
                {idStateProvince: {$eq: objectToUpdate.idStateProvince}},
            ]
        };
        return LokiJsUtil.findAllByQuery(this.collection, query)
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
