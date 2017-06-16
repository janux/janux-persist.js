/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
import {RoleDao} from "../role-dao";
import Promise = require("bluebird");
import {IEntityProperties} from "../../../index";
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {RoleEntity} from "../role-entity";

export class RoleDaoLokiJsImpl extends RoleDao {

    private collection: any;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.collection = dbEngineUtil.collection;
    }

    protected validateBeforeUpdate(objectToUpdate: RoleEntity): Promise<IValidationError[]> {
        const id = "id";
        const query = {
            $and: [
                {name: {$eq: objectToUpdate.name}},
                {$loki: {$ne: objectToUpdate[id]}}
            ]
        };
        return LokiJsUtil.findAllByQuery(this.collection, query)
            .then((result: RoleEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        "name",
                        "There is another role with the same name",
                        objectToUpdate.name));
                }
                return Promise.resolve(errors);
            });
    }
}
