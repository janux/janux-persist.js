/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as logger from 'log4js';
import {ValidationErrorImpl} from "../../../../persistence/implementations/dao/validation-error";
import JanuxPeople = require("janux-people");

export class PostalAddressValidator {

    public static readonly LINE_1 = "contacts.addresses.line1";
    public static readonly LINE_1_EMPTY = "Line 1 is empty";
    public static readonly POSTAL_CODE = "contacts.addresses.postalCode";
    public static readonly POSTAL_CODE_EMPTY = "Postal code is empty";
    public static readonly COUNTRY = "countryIsoCode";
    public static readonly COUNTRY_EMPTY = "countryIsoCode is empty";
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

    public static validatePostalAddress(address: JanuxPeople.PostalAddress): ValidationErrorImpl[] {

        this._log.debug("Call to validatePostalAddress with address: %j", address);
        const errors: ValidationErrorImpl[] = [];

        // TODO: later redefine validators.

        // if (isBlankString(address.line   1)) {
        //     errors.push(new ValidationErrorImpl(this.LINE_1, this.LINE_1_EMPTY, ""));
        // }

        // if (isBlankString(address.postalCode)) {
        //     errors.push(new ValidationErrorImpl(this.POSTAL_CODE, this.POSTAL_CODE_EMPTY, ""));
        // }

        // if (isBlankString(address.countryIsoCode)) {
        //     errors.push(new ValidationErrorImpl(this.COUNTRY, this.COUNTRY_EMPTY, ""));
        // }

        // if (_.isNull(address.idStateProvince)) {
        //     if (isBlankString(address.stateText)) {
        //         errors.push(new ValidationErrorImpl(this.STATE_TEXT, this.STATE_TEXT_EMPTY, ""));
        //     }
        // } else if (isBlankString(address.idStateProvince)) {
        //     errors.push(new ValidationErrorImpl(this.ID_STATE_PROVINCE, this.ID_STATE_PROVINCE_NOT_NULL, ""));
        // } else if (_.isNull(address.stateText) === false) {
        //     errors.push(new ValidationErrorImpl(this.STATE_TEXT, this.STATE_TEXT_NOT_NULL, ""));
        // }

        // if (_.isNull(address.idCity)) {
        //     if (isBlankString(address.cityText)) {
        //         errors.push(new ValidationErrorImpl(this.CITY_TEXT, this.CITY_TEXT_EMPTY, ""));
        //     }
        // } else if (isBlankString(address.idCity)) {
        //     errors.push(new ValidationErrorImpl(this.ID_CITY, this.ID_CITY_NOT_NULL, ""));
        // } else if (_.isNull(address.cityText) === false) {
        //     errors.push(new ValidationErrorImpl(this.CITY_TEXT, this.CITY_TEXT_NOT_NULL, ""));
        // }

        this._log.debug("Returning %j ", errors);
        return errors;
    }

    private static _log = logger.getLogger("PostalAddressValidator");
}
