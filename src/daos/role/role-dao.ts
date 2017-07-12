/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */

import * as _ from 'lodash';
import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {RoleEntity} from "./role-entity";
import Promise = require("bluebird");
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {RoleValidator} from "./role-validation";

export abstract class RoleDao extends AbstractDataAccessObjectWithEngine<RoleEntity> {

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    /**
     * Find all child nodes.
     * @param idParentRole The id of the parent node.
     * @return {Promise<any[]>} A promise containing the child nodes.
     */
    public findAllChildRoles(idParentRole: string): Promise<RoleEntity[]> {
        return this.findAllByAttribute("idParentRole", idParentRole);
    }

    /**
     * Find one role by name
     * @param name
     * @return {Promise<RoleEntity>}
     */
    public  findOneByName(name: string): Promise<RoleEntity> {
        return this.findOneByAttribute("name", name);
    }

    public findAllByNamesIn(names: string[]): Promise<RoleEntity[]> {
        return this.findAllByAttributeNameIn("name", names);
    }

    protected validateEntity(objectToValidate: RoleEntity): IValidationError[] {
        return RoleValidator.validateRole(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: RoleEntity): Promise<IValidationError[]> {
        return this.findOneByName(objectToInsert.name)
            .then((result: RoleEntity) => {
                const errors: ValidationError[] = [];
                if (result != null) {
                    errors.push(new ValidationError("name", "There is another role with the same name", ""));
                    return Promise.resolve(errors);
                } else {
                    return this.validateParentRole(objectToInsert);
                }
            });
    }

    protected validateParentRole(reference: RoleEntity): Promise<any> {
        if (reference.isRoot === false) {
            return new Promise<ValidationError[]>((resolve) => {
                this.findOneById(reference.idParentRole)
                    .then((resultQueryId: RoleEntity) => {
                        const errorId: ValidationError[] = [];
                        if (resultQueryId == null) {
                            errorId.push(new ValidationError(
                                "idParentRole",
                                "idParentRole has an invalid id",
                                reference.idParentRole));
                        } else {
                            if (resultQueryId.isRoot === false || _.isUndefined(resultQueryId.idParentRole) === false) {
                                errorId.push(new ValidationError(
                                    "idParentRole",
                                    "idParentRole is not a root role",
                                    reference.idParentRole));
                            }
                        }
                        resolve(errorId);
                    });
            });
        } else {
            return Promise.resolve([]);
        }
    }
}
