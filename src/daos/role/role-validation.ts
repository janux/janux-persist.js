/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
import * as _ from 'lodash';
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlank} from "../../util/blank-string-validator";
import {RoleEntity} from "./role-entity";
export class RoleValidator {

    public static NAME = "name";
    public static NAME_EMPTY = "Name is empty";
    public static DESCRIPTION = "description";
    public static DESCRIPTION_EMPTY = "Description is empty";
    public static ENABLED = "enabled";
    public static ENABLED_NOT_BOOLEAN = "enabled must be true or false";
    public static IS_ROOT = "isRoot";
    public static IS_ROOT_NOT_BOOLEAN = "isRoot must be true or false";
    public static ID_PARENT_ROLE = "idParentRole";
    public static ID_PARENT_ROLE_NOT_UNDEFINED = "idParentRole must be undefined";
    public static ID_PARENT_ROLE_EMPTY = "idParentRole must not be empty";

    public static validateRole(role: RoleEntity): ValidationError[] {
        this._log.debug("Call to validateRole with %j", role);
        const errors: ValidationError[] = [];
        if (isBlank(role.name)) {
            errors.push(new ValidationError(this.NAME, this.NAME_EMPTY, ""));
        }
        if (isBlank(role.description)) {
            errors.push(new ValidationError(this.DESCRIPTION, this.DESCRIPTION_EMPTY, ""));
        }
        if (_.isBoolean(role.enabled) === false) {
            errors.push(new ValidationError(this.ENABLED, this.ENABLED_NOT_BOOLEAN, ""));
        }
        if (_.isBoolean(role.isRoot) === false) {
            errors.push(new ValidationError(this.IS_ROOT, this.IS_ROOT_NOT_BOOLEAN, ""));
        } else {
            if (role.isRoot === true) {
                if (_.isUndefined(role.idParentRole) === false) {
                    errors.push(new ValidationError(this.ID_PARENT_ROLE, this.ID_PARENT_ROLE_NOT_UNDEFINED, ""));
                }
            } else if (isBlank(role.idParentRole) === true) {
                errors.push(new ValidationError(this.ID_PARENT_ROLE, this.ID_PARENT_ROLE_EMPTY, ""));
            }
        }

        this._log.debug("Returning %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("RoleValidator");
}
