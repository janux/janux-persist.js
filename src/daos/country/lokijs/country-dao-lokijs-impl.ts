/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {CountryDao} from "../country-dao";
import {CountryEntity} from "../country-entity";

export class CountryDaoLokiJsImpl extends CountryDao {

    private collection: any;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.collection = dbEngineUtil.collection;
    }

    protected validateBeforeUpdate<t>(objectToUpdate: CountryEntity): Promise<IValidationError[]> {
        const id = "id";

        const query = {
            $and: [
                {$loki: {$ne: _.toNumber(objectToUpdate[id])}},
                {
                    $or: [
                        {name: {$eq: objectToUpdate.name}},
                        {isoCode: {$eq: objectToUpdate.isoCode}}
                    ]
                }
            ]
        };

        return LokiJsUtil.findAllByQuery(this.collection, query)
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
                            "There is another country with the same ISO coe",
                            objectToUpdate.isoCode));
                    }
                }
                return Promise.resolve(errors);
            });
    }

}
