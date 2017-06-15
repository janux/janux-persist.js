/**
 * Project janux-persistence
 * Created by ernesto on 6/14/17.
 */
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlank} from "../../util/blank-string-validator";
import {DisplayNameEntity} from "./display-name-entity";
export class DisplayNameValidator {

    public static  validateDisplayName(displayName: DisplayNameEntity): ValidationError[] {
        this._log.debug("Call to validateDisplayName with displayName: %", displayName);
        const errors: ValidationError[] = [];
        if (isBlank(displayName.displayName)) {
            errors.push(new ValidationError("name", "Name is empty", ""));
        }
        return errors;
    }

    private static _log = logger.getLogger("DisplayNameValidator");
}
