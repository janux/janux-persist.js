/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var path = require("path");
var JanuxPeople = require("janux-people");
var StaffImplTest = require("../../../dist/example/people-extends/staff-imp-test").StaffImplTest;

//
// JAM-129: janux-persist depends on janux-people 1.0.2, which declares typeName instead of deriving
// it from the constructor's source (so it survives minification) and writes it into toJSON().
// PartyValidator and the party DAO dispatch on typeName, and StaffImplTest, a subclass, must keep
// its own.
//
describe("Testing the janux-people 1.0.2 dependency", function() {
	it("resolves a single copy of janux-people for janux-persist and its tests", function() {
		var fromDist = require.resolve("janux-people", { paths: [path.join(__dirname, "../../../dist")] });
		var fromTest = require.resolve("janux-people");
		expect(fromDist).eq(fromTest);
	});

	it("reports the declared type names", function() {
		expect(new JanuxPeople.Person("", "Ann", "", "Lee", "").typeName).eq("PersonImpl");
		expect(new JanuxPeople.Organization("Acme").typeName).eq("OrganizationImpl");
	});

	it("includes the type name when a person is serialized", function() {
		var json = new JanuxPeople.Person("", "Ann", "", "Lee", "").toJSON();
		expect(json.typeName).eq("PersonImpl");
	});

	it("keeps the subclass's own type name, which the party DAO dispatches on", function() {
		var staff = new StaffImplTest("", "Bo", "", "Ng", "", "C-1", 10);
		expect(staff.typeName).eq("StaffImplTest");
		expect(staff).instanceOf(JanuxPeople.Person);
	});

	it("lets a postal address take a state or province", function() {
		var address = new JanuxPeople.PostalAddress();
		address.stateProvince = "CA";
		expect(address.stateProvince).eq("CA");
	});
});
