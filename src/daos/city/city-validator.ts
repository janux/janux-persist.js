/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {CityEntity} from "./city-entity";

export class CityValidator {

    public static validateCity(city: CityEntity): ValidationError[] {
        this._log.debug("Call to validateCity with city: %j", city);
        const errors: ValidationError[] = [];
        if (isBlankString(city.code)) {
            errors.push(new ValidationError("code", "code must not be empty", ""));
        }
        if (isBlankString(city.name)) {
            errors.push(new ValidationError("name", "name must not be empty", ""));
        }
        if (isBlankString(city.idStateProvince)) {
            errors.push(new ValidationError("idStateProvince", "idStateProvince must not be empty", ""));
        }
        this._log.debug("Result: ", errors);
        return errors;
    }

    private static _log = logger.getLogger("CityValidator");
}
