/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */
import * as logger from 'log4js';
import {ValidationErrorImpl} from "../../../persistence/implementations/dao/validation-error";
import {isBlankString} from "../../../util/blank-string-validator";
import JanuxPeople = require("janux-people");

/**
 * Validates the content of the person.
 */
export class PersonValidator {

    public static readonly NAME_FIRST = "name.first";
    public static readonly NAME_MIDDLE = "name.middle";
    public static readonly NAME = "name";
    public static readonly PERSON_NAME_DUPLICATED = "There is another person with the same name";

    /**
     * Validate the content of the person.
     * @param person
     * @return {ValidationErrorImpl[]}
     */
    public static validatePerson(person: JanuxPeople.PersonImpl): ValidationErrorImpl[] {
        this._log.debug("Call to validatePerson with person: %j", person);
        const errors: ValidationErrorImpl[] = [];
        if (isBlankString(person.name.first)) {
            errors.push(new ValidationErrorImpl(this.NAME_FIRST, "First name is empty", ""));
        }
        /*if (isBlankString(person.name.middle)) {
            errors.push(new ValidationErrorImpl(this.NAME_MIDDLE, "Middle name is empty", ""));
        }*/
        this._log.debug("Returning errors: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("PersonValidator");
}
