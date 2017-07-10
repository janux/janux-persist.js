/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {UserRoleEntity} from "./user-role-entity";
export class UserRoleValidator {

    public static validateUserRole(userRole: UserRoleEntity): ValidationError[] {
        this._log.debug("Call to validateUserRole with userRole %j", userRole);
        const errors: ValidationError[] = [];
        if (isBlankString(userRole.idAccount)) {
            errors.push(new ValidationError("idAccount", "idAccount is empty", ""));
        }
        if (isBlankString(userRole.idRole)) {
            errors.push(new ValidationError("idRole", "idRole is empty", ""));
        }
        this._log.debug("Returning: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("UserRoleValidator");
}
