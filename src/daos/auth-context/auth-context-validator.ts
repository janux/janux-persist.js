/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */
import * as _ from "lodash";
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlank} from "../../util/blank-string-validator";
import {AuthContextEntity} from "./auth-context-entity";

export class AuthContextValidator {

    public static  validateAuthContext(authContext: AuthContextEntity): ValidationError[] {
        this._log.debug("Call to validateAuthContext with authContext: %j", authContext);
        const errors: ValidationError[] = [];
        if (isBlank(authContext.name) === true) {
            errors.push(new ValidationError("name", "Name is empty", ""));
        }
        if (isBlank(authContext.description) === true) {
            errors.push(new ValidationError("description", "Description is empty", ""));
        }
        if (_.isNumber(authContext.sortOrder) === false) {
            errors.push(new ValidationError("sortOrder", "Sort order must be a number", ""));
        }

        if (_.isBoolean(authContext.enabled) === false) {
            errors.push(new ValidationError("enabled", "Enabled must be a boolean", ""));
        }
        this._log.debug("Returning %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("AuthContextValidator");
}
