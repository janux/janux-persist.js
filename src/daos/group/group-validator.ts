/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import * as logger from 'log4js';
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {GroupEntity} from "./group-entity";

export class GroupValidator {

    public static readonly NAME = "name";
    public static readonly CODE = "code";
    public static readonly NAME_EMPTY = "name is empty";
    public static readonly CODE_EMPTY = "code is empty";

    /**
     * Validate the entity
     * @param {GroupEntity} objectToValidate The object to validate.
     * @return {ValidationErrorImpl[]} Returns an empty array if the object is valid. If it is no valid,
     * return an array containing the errors.
     */
    public static validate(objectToValidate: GroupEntity): ValidationErrorImpl[] {
        this._log.debug("Call to validate with objectToValidate %j", objectToValidate);
        const errors: ValidationErrorImpl[] = [];
        if (isBlankString(objectToValidate.name)) {
            errors.push(new ValidationErrorImpl(this.NAME, this.NAME_EMPTY, null));
        }
        if (isBlankString(objectToValidate.code)) {
            errors.push(new ValidationErrorImpl(this.CODE, this.CODE_EMPTY, null));
        }
        return errors;
    }
    private static _log = logger.getLogger("GroupValidator");
}
