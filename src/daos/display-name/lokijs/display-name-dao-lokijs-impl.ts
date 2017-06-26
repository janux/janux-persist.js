/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
import * as _ from "lodash";
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {DisplayNameDao} from "../display-name-dao";
import {DisplayNameEntity} from "../display-name-entity";
import Promise = require("bluebird");
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";

export class DisplayNameDaoLokijsImpl extends DisplayNameDao {

    private collection: any;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.collection = dbEngineUtil.collection;
    }

    protected validateBeforeUpdate<t>(objectToUpdate: DisplayNameEntity): Promise<IValidationError[]> {
        const query = {
            $and: [
                {$loki: {$ne: _.toNumber(objectToUpdate.id)}},
                {displayName: {$eq: objectToUpdate.displayName}}
            ]
        };
        return LokiJsUtil.findAllByQuery(this.collection, query)
            .then((result: DisplayNameEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        "displayName",
                        "There is another record with the same name",
                        objectToUpdate.displayName));
                }
                return Promise.resolve(errors);
            });
    }
}
