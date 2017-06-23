/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
import * as _ from 'lodash';
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlank} from "../../util/blank-string-validator";
import {StateProvinceEntity} from "./state-province-entity";

export class StateProvinceValidator {

    public static  validateStateProvince(stateProvince: StateProvinceEntity): ValidationError[] {
        this._log.debug("Call to validateStateProvince with stateProvince: %j", stateProvince);
        const errors: ValidationError[] = [];
        if (isBlank(stateProvince.name)) {
            errors.push(new ValidationError("name", "Name is empty", ""));
        }
        if (isBlank(stateProvince.code)) {
            errors.push(new ValidationError("code", "Code is empty", ""));
        }
        if (_.isNumber(stateProvince.sortOrder) === false) {
            errors.push(new ValidationError("sortOrder", "sortOrder must be a number", ""));
        }
        if (isBlank(stateProvince.idCountry)) {
            errors.push(new ValidationError("idCountry", "idCountry is empty", ""));
        }
        this._log.debug("error: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("StateProvinceValidator");
}
