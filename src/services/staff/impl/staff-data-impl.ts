/**
 * Project janux-persist.js
 * Created by ernesto on 3/20/18
 */
import { StaffDataEntity } from "daos/staff-data/staff-data-entity";
import { StaffData } from "services/staff/api/staff-data";

export class StaffDataImpl implements StaffData {
	public static fomJSON(object: any): StaffDataImpl {
		if (object == null) return object;
		return new StaffDataImpl(object.isExternal, object.jobTitle, object.jobDepartment);
	}

	public static toEntity(staff: StaffDataImpl, idContact: string): StaffDataEntity {
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

	constructor(isExternal: boolean, jobTitle: string, jobDepartment: string) {
		this.isExternal = isExternal;
		this.jobTitle = jobTitle;
		this.jobDepartment = jobDepartment;
	}
}
