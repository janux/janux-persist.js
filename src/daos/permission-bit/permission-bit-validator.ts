/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */

import * as _ from 'lodash';
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {PermissionBitEntity} from "./permission-bit-entity";
export class PermissionBitValidator {

    public static validatePermissionBit(permissionBit: PermissionBitEntity): ValidationError[] {
        this._log.debug("Call to validate with permissionBit: %j", permissionBit);
        let errors: ValidationError[];
        errors = this.validatePermissionBitWithNoIdAuthContext(permissionBit);
        if (isBlankString(permissionBit.idAuthContext)) {
            errors.push(new ValidationError(
                "idAuthContext",
                "idAuthContext must not be empty",
                permissionBit.position.toString()));
        }

        this._log.debug("Errors: %j", errors);
        return errors;
    }

    public static  validatePermissionBitWithNoIdAuthContext(permissionBit: PermissionBitEntity): ValidationError[] {
        this._log.debug("Call to validatePermissionBitWithNoIdAuthContext with permissionBit: %j", permissionBit);
        const errors: ValidationError[] = [];
        if (isBlankString(permissionBit.name)) {
            errors.push(new ValidationError("name", "Name is empty", ""));
        }
        if (isBlankString(permissionBit.description)) {
            errors.push(new ValidationError("description", "Name is empty", ""));
        }
        if (_.isNumber(permissionBit.position) === false) {
            errors.push(new ValidationError(
                "position",
                "Position must be a number",
                permissionBit.position.toString()));
        } else if (permissionBit.position < 0) {
            errors.push(new ValidationError(
                "position",
                "Position must be grater or equal than zero",
                permissionBit.position.toString()));
        }

        this._log.debug("Errors: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("PermissionBitValidator");
}
