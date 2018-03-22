/**
 * Project janux-persist.js
 * Created by ernesto on 3/20/18
 */
import {StaffDataEntity} from "daos/staff-data/staff-data-entity";
import {Staff} from "services/staff/api/staff";

export class StaffImpl implements Staff {

	public static fomJSON(object: any): StaffImpl {
		if (object == null) return object;
		const staff: StaffImpl = new StaffImpl();
		staff.isExternal = object.isExternal;
		staff.jobDepartment = object.jobDepartment;
		staff.jobTitle = object.jobTitle;
		return staff;
	}

	public static toEntity(staff: StaffImpl, idContact: string): StaffDataEntity {
		if (staff == null) return undefined;
		const entity: StaffDataEntity = new StaffDataEntity();
		entity.idContact = idContact;
		entity.jobTitle = staff.jobTitle;
		entity.jobDepartment = staff.jobDepartment;
		entity.isExternal = staff.isExternal;
		return entity;
	}

	isExternal: boolean;
	jobTitle: string;
	jobDepartment: string;
}
