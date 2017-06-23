/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as logger from 'log4js';
import {ValidationError} from "../../../persistence/impl/validation-error";
import {isBlank} from "../../../util/blank-string-validator";
import {OrganizationEntity} from "./organization-entity";

export class OrganizationValidator {

    public static readonly NAME = "name";
    public static readonly NAME_EMPTY = "Organization name is empty";

    public static validateOrganization(organization: OrganizationEntity): ValidationError[] {
        this._log.debug("Call to validateOrganization with organization: %j", organization);
        const errors: ValidationError[] = [];
        if (isBlank(organization.name)) {
            errors.push(new ValidationError(this.NAME, this.NAME_EMPTY, ""));
        }
        this._log.debug("Returning errors: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("OrganizationValidator");
}
