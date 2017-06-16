/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */

import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {RoleEntity} from "./role-entity";
import Promise = require("bluebird");
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {RoleValidator} from "./role-validation";

export abstract class RoleDao extends AbstractDataAccessObjectWithEngine<RoleEntity> {

    private dbEngineUtilLocal: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.dbEngineUtilLocal = dbEngineUtil;
    }

    public  findOneByName(name: string): Promise<RoleEntity> {
        return this.dbEngineUtilLocal.findOneByAttribute("name", name);
    }

    protected validateEntity(objectToValidate: RoleEntity): IValidationError[] {
        return RoleValidator.validateRole(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: RoleEntity): Promise<IValidationError[]> {
        return this.findOneByName(objectToInsert.name)
            .then((result) => {
                const errors: ValidationError[] = [];
                if (result != null) {
                    errors.push(
                        new ValidationError(
                            "name",
                            "There is another role with the same name",
                            objectToInsert.name));
                }
                return Promise.resolve(errors);
            });
    }
}
