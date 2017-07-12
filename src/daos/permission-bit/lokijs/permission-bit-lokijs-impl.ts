/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {PermissionBitDao} from "../permission-bit-dao";
import {PermissionBitEntity} from "../permission-bit-entity";

export class PermissionBitLokijsImpl extends PermissionBitDao {

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    protected validateBeforeUpdate<t>(objectToUpdate: PermissionBitEntity): Promise<IValidationError[]> {
        const query = {
            $and: [
                {$loki: {$ne: _.toNumber(objectToUpdate.id)}},
                {name: {$eq: objectToUpdate.name}},
                {idAuthContext: {$eq: objectToUpdate.idAuthContext}}
            ]
        };
        return this.findAllByQuery(query)
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
