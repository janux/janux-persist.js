/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
import * as _ from 'lodash';
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlank} from "../../util/blank-string-validator";
import {CountryEntity} from "./country-entity";

export class CountryValidator {

    public static validateCountry(country: CountryEntity): ValidationError[] {
        const errors: ValidationError[] = [];
        if (isBlank(country.name)) {
            errors.push(new ValidationError("name", "Name is empty", ""));
        }
        if (isBlank(country.isoCode)) {
            errors.push(new ValidationError("isoCode", "ISO code is empty", ""));
        } else if (country.isoCode.length !== 2) {
            errors.push(new ValidationError("isoCode", "ISO code is not a two characters code", ""));
        }
        if (_.isNumber(country.sortOrder) === false) {
            errors.push(new ValidationError("sortOrder", "sortOrder must be a number", ""));
        }
        return errors;
    }

    private static _log = logger.getLogger("CountryValidator");
}
