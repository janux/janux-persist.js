/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */
import * as logger from 'log4js';
import {ValidationError} from "../../../persistence/impl/validation-error";
import {isBlank} from "../../../util/blank-string-validator";
import {PersonEntity} from "./person-entity";

export class PersonValidator {

    public static readonly NAME_FIRST = "name.first";
    public static readonly NAME_MIDDLE = "name.middle";

    public static validatePerson(person: PersonEntity): ValidationError[] {
        this._log.debug("Call to validatePerson with person: %j", person);
        const errors: ValidationError[] = [];
        if (isBlank(person.name.first)) {
            errors.push(new ValidationError(this.NAME_FIRST, "First name is empty", ""));
        }
        if (isBlank(person.name.middle)) {
            errors.push(new ValidationError(this.NAME_MIDDLE, "Middle name is empty", ""));
        }
        this._log.debug("Returning errors: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("PersonValidator");
}
