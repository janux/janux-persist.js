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

    public static validateRole(role: RoleEntity): ValidationError[] {
        this._log.debug("Call to validateRole with %j", role);
        const errors: ValidationError[] = [];
        if (isBlank(role.name)) {
            errors.push(new ValidationError("name", "Name is empty", ""));
        }
        if (isBlank(role.description)) {
            errors.push(new ValidationError("description", "Description is empty", ""));
        }
        if (_.isBoolean(role.enabled) === false) {
            errors.push(new ValidationError("enabled", "enabled must be true or false", ""));
        }
        if (_.isBoolean(role.isRoot) === false) {
            errors.push(new ValidationError("isRoot", "isRoot must be true or false", ""));
        } else {
            if (role.isRoot === true) {
                if (_.isUndefined(role.idParentRole) === false) {
                    errors.push(new ValidationError("idParentRole", "idParentRole must be undefined", ""));
                }
            } else if (isBlank(role.idParentRole) === true) {
                errors.push(new ValidationError("idParentRole", "idParentRole must not be empty", ""));
            }
        }

        this._log.debug("Returning %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("RoleValidator");
}
