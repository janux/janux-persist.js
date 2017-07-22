/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as JanuxPeople from "janux-people.js";
import * as logger from 'log4js';
import {ValidationError} from "../../../persistence/impl/validation-error";
import {isBlankString} from "../../../util/blank-string-validator";

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
     * @return {ValidationError[]}
     */
    public static validateOrganization(organization: JanuxPeople.Organization): ValidationError[] {
        this._log.debug("Call to validateOrganization with organization: %j", organization);
        const errors: ValidationError[] = [];
        if (isBlankString(organization.name)) {
            errors.push(new ValidationError(this.NAME, this.NAME_EMPTY, ""));
        }
        this._log.debug("Returning errors: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("OrganizationValidator");
}
