/**
 * Project
 * Created by ernesto on 8/28/17.
 */
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {isBlankString} from "util/blank-string-validator";
import * as logger from 'util/logger-api/logger-api';
import {GroupAttributeValueEntity} from "./group-attribute-value";

export class GroupAttributeValueValidator {

	public static readonly ID_GROUP = "idGroup";
	public static readonly ID_GROUP_EMPTY = "idGroup is empty";
	public static readonly KEY = "key";
	public static readonly VALUE = "value";
	public static readonly KEY_EMPTY = "key is empty";
	public static readonly VALUE_EMPTY = "value is empty";
	public static readonly DUPLICATED_KEY: string = "There is a record with the same key and the same idGroup";

	public static validate(objectToValidate: GroupAttributeValueEntity): ValidationErrorImpl[] {
		this._log.debug("Call to validate with %j", objectToValidate);
		const errors: ValidationErrorImpl[] = [];
		if (isBlankString(objectToValidate.idGroup)) {
			errors.push(new ValidationErrorImpl(this.ID_GROUP, this.ID_GROUP_EMPTY, ""));
		}
		if (isBlankString(objectToValidate.key)) {
			errors.push(new ValidationErrorImpl(this.KEY, this.KEY_EMPTY, ""));
		}
		if (isBlankString(objectToValidate.value)) {
			errors.push(new ValidationErrorImpl(this.VALUE, this.VALUE_EMPTY, ""));
		}
		this._log.debug("Returning %j", errors);
		return errors;
	}

	private static _log = logger.getLogger("GroupAttributeValueValidator");
}
