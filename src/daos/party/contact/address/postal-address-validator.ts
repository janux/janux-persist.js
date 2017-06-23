/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as _ from 'lodash';
import * as logger from 'log4js';
import {ValidationError} from "../../../../persistence/impl/validation-error";
import {isBlank} from "../../../../util/blank-string-validator";
import {PostalAddress} from "./postal-address";
export class PostalAddressValidator {

    public static readonly LINE_1 = "contacts.addresses.line1";
    public static readonly LINE_1_EMPTY = "Line 1 is empty";
    public static readonly POSTAL_CODE = "contacts.addresses.postalCode";
    public static readonly POSTAL_CODE_EMPTY = "Postal code is empty";
    public static readonly COUNTRY = "idCountry";
    public static readonly COUNTRY_EMPTY = "idCountry is empty";
    public static readonly STATE_TEXT = "stateText";
    public static readonly STATE_TEXT_EMPTY = "stateText is empty";
    public static readonly STATE_TEXT_NOT_NULL = "stateText must be null";
    public static readonly CITY_TEXT = "cityText";
    public static readonly CITY_TEXT_EMPTY = "cityText is empty";
    public static readonly CITY_TEXT_NOT_NULL = "cityText must be null";
    public static readonly ID_STATE_PROVINCE = "idStateProvince";
    public static readonly ID_CITY = "idCity";
    public static readonly ID_STATE_PROVINCE_NOT_NULL = "idStateProvince must be null";
    public static readonly ID_CITY_NOT_NULL = "idCity must be null";

    public static validatePostalAddress(address: PostalAddress): ValidationError[] {

        this._log.debug("Call to validatePostalAddress with address: %j", address);
        const errors: ValidationError[] = [];

        if (isBlank(address.line1)) {
            errors.push(new ValidationError(this.LINE_1, this.LINE_1_EMPTY, ""));
        }

        if (isBlank(address.postalCode)) {
            errors.push(new ValidationError(this.POSTAL_CODE, this.POSTAL_CODE_EMPTY, ""));
        }

        if (isBlank(address.idCountry)) {
            errors.push(new ValidationError(this.COUNTRY, this.COUNTRY_EMPTY, ""));
        }

        if (_.isNull(address.idStateProvince)) {
            if (isBlank(address.stateText)) {
                errors.push(new ValidationError(this.STATE_TEXT, this.STATE_TEXT_EMPTY, ""));
            }
        } else if (isBlank(address.idStateProvince)) {
            errors.push(new ValidationError(this.ID_STATE_PROVINCE, this.ID_STATE_PROVINCE_NOT_NULL, ""));
        } else if (_.isNull(address.stateText) === false) {
            errors.push(new ValidationError(this.STATE_TEXT, this.STATE_TEXT_NOT_NULL, ""));
        }

        if (_.isNull(address.idCity)) {
            if (isBlank(address.cityText)) {
                errors.push(new ValidationError(this.CITY_TEXT, this.CITY_TEXT_EMPTY, ""));
            }
        } else if (isBlank(address.idCity)) {
            errors.push(new ValidationError(this.ID_CITY, this.ID_CITY_NOT_NULL, ""));
        } else if (_.isNull(address.cityText) === false) {
            errors.push(new ValidationError(this.CITY_TEXT, this.CITY_TEXT_NOT_NULL, ""));
        }

        this._log.debug("Returning %j ", errors);
        return errors;
    }

    private static _log = logger.getLogger("PostalAddressValidator");
}
