/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {AccountRoleEntity} from "./account-role-entity";
export class AccountRoleValidator {

    public static validatedAccountRole(accountRole: AccountRoleEntity): ValidationError[] {
        this._log.debug("Call to validatedAccountRole with accountRole %j", accountRole);
        const errors: ValidationError[] = [];
        if (isBlankString(accountRole.idAccount)) {
            errors.push(new ValidationError("idAccount", "idAccount is empty", ""));
        }
        if (isBlankString(accountRole.idRole)) {
            errors.push(new ValidationError("idRole", "idRole is empty", ""));
        }
        this._log.debug("Returning: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("AccountRoleValidator");
}
