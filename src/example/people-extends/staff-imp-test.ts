/**
 * Project janux-persist.js
 * Created by ernesto on 11/14/17.
 */
import {PartyAbstract, Person} from "janux-people";

export class StaffImplTest extends Person {

	public static fromJSON(obj: any): StaffImplTest {
		let staff: StaffImplTest = new StaffImplTest(
			obj.name.honorificPrefix,
			obj.name.first,
			obj.name.middle,
			obj.name.last,
			obj.name.honorificSuffix,
			obj.contractNumber,
			obj.currentEarnings
		);

		staff = PartyAbstract.fromJSON(obj, staff);

		return staff;
	}

	public contractNumber: string;
	public currentEarnings: number;

	constructor(honorificPrefix: string,
				first: string,
				middle: string,
				last: string,
				honorificSuffix: string,
				contactNumber: string,
				currentEarnings: number) {
		super(honorificPrefix, first, middle, last, honorificSuffix);
		this.contractNumber = contactNumber;
		this.currentEarnings = currentEarnings;
	}

	get typeName(): string {
		return "StaffImplTest";
	}

	public toJSON(): StaffImplTest {
		const out: any = this.contactMethods;
		out.displayName = this.name.shortName;
		out.contractNumber = this.contractNumber;
		out.currentEarnings = this.currentEarnings;
		out.name = this.name.toJSON();
		return out;
	}
}
