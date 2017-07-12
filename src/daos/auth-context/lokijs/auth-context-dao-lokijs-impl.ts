/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */

import * as Promise from "bluebird";
import * as _ from 'lodash';
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {AuthContextDao} from "../auth-context-dao";
import {AuthContextEntity} from "../auth-context-entity";

export class AuthContextLokijsImpl extends AuthContextDao {

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    protected validateBeforeUpdate(objectToUpdate: AuthContextEntity): Promise<IValidationError[]> {
        const query = {
            $and: [
                {$loki: {$ne: _.toNumber(objectToUpdate.id)}},
                {name: {$eq: objectToUpdate.name}}
            ]
        };
        return this.findAllByQuery(query)
            .then((result: AuthContextEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        "name",
                        "There is another record with the same name",
                        objectToUpdate.name));
                }
                return Promise.resolve(errors);
            });
    }
}
