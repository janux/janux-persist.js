/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import * as Bluebird from "bluebird";
import * as _ from "lodash";
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {StateProvinceDao} from "../state-province-dao";
import {StateProvinceEntity} from "../state-province-entity";

export class StateProvinceDaoLokiJsImpl extends StateProvinceDao {

    private collection: any;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.collection = dbEngineUtil.collection;
    }

    protected validateBeforeUpdate<t>(objectToUpdate: StateProvinceEntity): Bluebird<IValidationError[]> {
        const query = {
            $and: [
                {$loki: {$ne: _.toNumber(objectToUpdate.id)}},
                {code: {$eq: objectToUpdate.code}},
                {countryIsoCode: {$eq: objectToUpdate.countryIsoCode}},
            ]
        };
        return LokiJsUtil.findAllByQuery(this.collection, query)
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
