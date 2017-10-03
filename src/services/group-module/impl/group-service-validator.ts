/**
 * Project
 * Created by ernesto on 8/28/17.
 */
import {GroupEntity} from "daos/group/group-entity";
import {GroupValidator} from "daos/group/group-validator";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {isBlankString} from "util/blank-string-validator";
import * as logger from 'util/logger-api/logger-api';
import {GroupImpl} from "./group";

export class GroupServiceValidator {

	public static readonly ATTRIBUTE: string = "Attribute";
	public static readonly ITEM: string = "Item";
	public static readonly ITEM_EMPTY: string = "The item is null or undefined";
	public static readonly ATTRIBUTE_VALUE_EMPTY: string = "The attribute with the key does not have a valid string value";
	public static readonly DUPLICATED_GROUP: string = "There is a group with the same code";
	public static readonly NO_GROUP: string = "There is no group given the code";
	public static log = logger.getLogger("GroupServiceValidator");

	/**
	 * Validate the content of the group.
	 * @param {GroupImpl<any>} group
	 * @return {ValidationErrorImpl[]}
	 */
	public static validateGroup(group: GroupImpl<any>): ValidationErrorImpl[] {
		let errors: ValidationErrorImpl[];

		// Emulate a group entity in order to use an existing validator.
		const groupEntity: GroupEntity = new GroupEntity();
		groupEntity.name = group.name;
		groupEntity.description = group.name;
		groupEntity.code = group.code;
		groupEntity.type = group.type;
		errors = GroupValidator.validate(groupEntity);

		// Add the attributes validation.
		const keys: string[] = Object.keys(group.attributes);
		for (const key of keys) {
			if (isBlankString(group.attributes[key])) {
				errors.push(new ValidationErrorImpl(
					this.ATTRIBUTE,
					this.ATTRIBUTE_VALUE_EMPTY,
					key
				));
			}
		}

		return errors;
	}
}
