/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
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
        this._log.debug("Returning %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("RoleValidator");
}
