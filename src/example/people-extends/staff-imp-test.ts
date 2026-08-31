/**
 * Project janux-persist.js
 * Created by ernesto on 11/14/17.
 */
import { PartyAbstract, Person } from "janux-people";

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

	constructor(
		honorificPrefix: string,
		first: string,
		middle: string,
		last: string,
		honorificSuffix: string,
		contactNumber: string,
		currentEarnings: number
	) {
		super(honorificPrefix, first, middle, last, honorificSuffix);
		this.contractNumber = contactNumber;
		this.currentEarnings = currentEarnings;
	}

	// @ts-ignore TS2611: janux-people is compiled with TS 3.1.8, whose declaration emit
	// flattens `get typeName()` to `readonly typeName`, so TS 4.9 sees this override as
	// widening a "property" to an accessor. It's a real prototype-level accessor override
	// at runtime (correctly shadowing PersonImpl's getter) and must stay a getter: a plain
	// field here throws at runtime ("Cannot set property typeName ... which has only a
	// getter"), because PersonImpl.prototype.typeName has no setter for `this.typeName = x`
	// to hit. See janux-persist.js/CLAUDE.md.
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
