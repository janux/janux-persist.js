/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import * as logger from 'log4js';
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {GroupContentEntity} from "./group-content-entity";

export class GroupContentValidator {

    public static readonly ID_GROUP = "idGroup";
    public static readonly ID_GROUP_EMPTY = "idGroup is empty";
    public static readonly ID_OBJECT = "objectGroup";
    public static readonly ID_OBJECT_EMPTY = "objectGroup is empty";

    public static validate(objectToValidate: GroupContentEntity): ValidationErrorImpl[] {
        const errors: ValidationErrorImpl[] = [];
        if (isBlankString(objectToValidate.idGroup)) {
            errors.push(new ValidationErrorImpl(this.ID_GROUP, this.ID_GROUP_EMPTY, null));
        }

        // if (isBlankString(objectToValidate.collectionName)) {
        //     errors.push(new ValidationErrorImpl(this.COLLECTION_NAME, this.COLLECTION_NAME_EMPTY, null));
        // }

        if (isBlankString(objectToValidate.objectGroup)) {
            errors.push(new ValidationErrorImpl(this.ID_OBJECT, this.ID_OBJECT_EMPTY, null));
        }
        return errors;
    }

    private static _log = logger.getLogger("GroupContentValidator");
}
