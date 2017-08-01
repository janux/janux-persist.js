/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as logger from 'log4js';
import {ValidationErrorImpl} from "../../../persistence/implementations/dao/validation-error";
import {isBlankString} from "../../../util/blank-string-validator";
import JanuxPeople = require("janux-people.js");

/**
 * Validates the content of the organization.
 */
export class OrganizationValidator {

    public static readonly NAME = "name";
    public static readonly NAME_DUPLICATED = "There is another organization with the same name";
    public static readonly NAME_EMPTY = "Organization name is empty";

    /**
     * Validate if the organization content is valid.
     * @param organization The organization to validate.
     * @return {ValidationErrorImpl[]}
     */
    public static validateOrganization(organization: JanuxPeople.Organization): ValidationErrorImpl[] {
        this._log.debug("Call to validateOrganization with organization: %j", organization);
        const errors: ValidationErrorImpl[] = [];
        if (isBlankString(organization.name)) {
            errors.push(new ValidationErrorImpl(this.NAME, this.NAME_EMPTY, ""));
        }
        this._log.debug("Returning errors: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("OrganizationValidator");
}
