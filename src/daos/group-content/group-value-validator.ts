/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import * as logger from 'log4js';
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {GroupValueEntity} from "./group-value-entity";

export class GroupValueValidator {

    public static readonly ID_GROUP = "idGroup";
    public static readonly ID_GROUP_EMPTY = "idGroup is empty";
    public static readonly OBJECT_GROUP = "value";
    public static readonly OBJECT_GROUP_EMPTY = "value is empty";
    public static readonly CANT_UPDATE = "You can't update a group values entity, only insert and delete";

    public static validate(objectToValidate: GroupValueEntity): ValidationErrorImpl[] {
        this._log.debug("Call to validate with objectToValidate %j", objectToValidate);
        const errors: ValidationErrorImpl[] = [];
        if (isBlankString(objectToValidate.idGroup)) {
            errors.push(new ValidationErrorImpl(this.ID_GROUP, this.ID_GROUP_EMPTY, null));
        }

        // if (isBlankString(objectToValidate.collectionName)) {
        //     errors.push(new ValidationErrorImpl(this.COLLECTION_NAME, this.COLLECTION_NAME_EMPTY, null));
        // }

        if (objectToValidate.value == null) {
            errors.push(new ValidationErrorImpl(this.OBJECT_GROUP, this.OBJECT_GROUP_EMPTY, null));
        }
        return errors;
    }

    private static _log = logger.getLogger("GroupValueValidator");
}
