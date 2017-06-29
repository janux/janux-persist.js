/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {RolePermissionBitEntity} from "./role-permission-bit-entity";
export class RolePermissionBitValidator {

    public static validateRolePermissionBit(rolePermissionBit: RolePermissionBitEntity): ValidationError[] {
        this._log.debug("Call validateRolePermissionBit with rolePermissionBit: %j", rolePermissionBit);
        const errors: ValidationError[] = [];
        if (isBlankString(rolePermissionBit.idPermissionBit)) {
            errors.push(new ValidationError("idPermissionBit", "idPermissionBit is empty", ""));
        }
        if (isBlankString(rolePermissionBit.idRole)) {
            errors.push(new ValidationError("idRole", "idRole is empty", ""));
        }
        this._log.debug("Result errors: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("RolePermissionBitValidator");
}
