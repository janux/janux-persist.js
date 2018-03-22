/**
 * Project janux-persist.js
 * Created by ernesto on 3/20/18
 */
import {StaffDataEntity} from "daos/staff-data/staff-data-entity";
import * as _ from "lodash";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {isBlankString} from "utils/string/blank-string-validator";

export class StaffDataEntityValidator {
	public static readonly ID_CONTACT_EMPTY: string = "idContact is empty";
	public static readonly EXTERNAL: string = "External attribute";
	public static readonly EXTERNAL_NOT_BOOLEAN: string = "External must be a boolean value";
	public static readonly ID_CONTACT: string = "idContact";
	public static readonly ID_CONTACT_DUPLICATED: string = "There is a record with the same idContact";

	public static validate(staffEntity: StaffDataEntity): ValidationErrorImpl[] {
		const errors: ValidationErrorImpl[] = [];
		if (isBlankString(staffEntity.idContact)) {
			errors.push(new ValidationErrorImpl(this.ID_CONTACT, this.ID_CONTACT_EMPTY, ""));
		}

		if (staffEntity != null && !_.isBoolean(staffEntity.isExternal)) {
			errors.push(new ValidationErrorImpl(this.EXTERNAL, this.EXTERNAL_NOT_BOOLEAN, ""));
		}

		return errors;
	}
}
