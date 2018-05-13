/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */
var chai = require('chai');
var expect = chai.expect;
var PersonEntity = require("janux-people").Person;
var OrganizationEntity = require("janux-people").Organization;
var PartyValidator = require("../../../../dist/index").PartyValidator;
var OrganizationValidator = require("../../../../dist/index").OrganizationValidator;
var EmailAddress = require("janux-people").EmailAddress;

const name = "John";
const middleName = "Doe";
const email = "glarus@mail.com";
const email2 = "glarus_sales@mail.com";
const work = "work";
const home = "home";
const phone = "55-55-55-55";
const phone2 = "55-55-55-56";
const cityText = "Mexico city";
const stateText = "CDMX";
const countryIsoCode = "MX";
const address = "An address";
const postalCode = "05000";


describe("Party validator", function () {

	function generateSampleOrganization() {
		var organization = new OrganizationEntity();
		organization.name = name;
		organization.isSupplier = true;
		organization.isReseller = false;
		organization.functionsProvided = ['AGENT', 'GUARD'];
		var emailObject = new EmailAddress(email);
		organization.setContactMethod(work, emailObject);
		return organization;
	}


	describe("When validating a person with correct values", function () {
		it("The method should not return an error", function () {
			var person = new PersonEntity();
			person.name.first = name;
			person.name.middle = middleName;
			var emailObject = new EmailAddress(email);
			person.setContactMethod(work, emailObject);
			var errors = PartyValidator.validateParty(person);
			expect(errors.length).eq(0);
		})
	});

	describe("When validating a organization with correct values", function () {
		it("The method should not return an error", function () {
			var organization = generateSampleOrganization();
			var errors = PartyValidator.validateParty(organization);
			expect(errors.length).eq(0);
		})
	});


	describe("When validating isSupplier as not boolean", function () {
		it("The method should return an error", function () {
			var organization = generateSampleOrganization();
			organization.isSupplier = 1234;
			var errors = PartyValidator.validateParty(organization);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(OrganizationValidator.IS_SUPPLIER);
			expect(errors[0].message).eq(OrganizationValidator.MUST_BE_BOOLEAN);
		});
	});


	describe("When validating isReseller as not boolean", function () {
		it("The method should return an error", function () {
			var organization = generateSampleOrganization();
			organization.isReseller = 1234;
			var errors = PartyValidator.validateParty(organization);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(OrganizationValidator.IS_RESELLER);
			expect(errors[0].message).eq(OrganizationValidator.MUST_BE_BOOLEAN);
		});
	});


	describe("When calling validate with an invalid functionsProvided value", function () {
		it("The method should return an error", function () {
			var organization = generateSampleOrganization();
			organization.functionsProvided = 1234;
			var errors = PartyValidator.validateParty(organization);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(OrganizationValidator.FUNCTIONS_PROVIDED);
			expect(errors[0].message).eq(OrganizationValidator.NOT_ARRAY);
		});
	});


	describe("When callign validate whith an invalid functionsProvided item value", function () {
		it("The method should return en error", function () {
			var organization = generateSampleOrganization();
			organization.functionsProvided.push(12334);
			var errors = PartyValidator.validateParty(organization);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(OrganizationValidator.FUNCTIONS_PROVIDED);
			expect(errors[0].message).eq(OrganizationValidator.ELEMENT_NOT_STRING);
		});
	});


	/*describe("When validating a party with no emails", function () {
     it("The method should return an error", function () {
     var person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = PartyValidator.PERSON;
     var errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.CONTACTS_EMAILS);
     expect(errors[0].message).eq(PartyValidator.AT_LEAST_ONE_EMAIL);
     });
     });*/

	/* describe("When validating a party with duplicated email addresses", function () {
     it("The method should return an error", function () {
     var person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = PartyValidator.PERSON;
     person.emails.push(new EmailAddress(work, true, email));
     person.emails.push(new EmailAddress(home, false, email));
     var errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.CONTACTS_EMAILS);
     expect(errors[0].message).eq(PartyValidator.DUPLICATED_EMAILS);
     });
     });*/

	/*  describe("When validating a party with no valid type", function () {
     it("The method should return an error", function () {
     var person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = "  ";
     var errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.TYPE);
     expect(errors[0].message).eq(PartyValidator.TYPE_EMPTY);

     person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = "invalid";
     errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.TYPE);
     expect(errors[0].message).eq("Type is not " + PartyValidator.PERSON + " or " + PartyValidator.ORGANIZATION);
     });
     });*/

	/* describe("When validating emails with no primary email", function () {
     it("The method should return an error", function () {
     var person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = PartyValidator.PERSON;
     person.emails.push(new EmailAddress(work, false, email));
     person.emails.push(new EmailAddress(home, false, email2));
     var errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.CONTACTS_EMAILS);
     expect(errors[0].message).eq(PartyValidator.NO_PRIMARY_CONTACT);
     })
     });

     describe("When validating emails with more than one email marked as primary", function () {
     it("The method should return an error", function () {
     var person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = PartyValidator.PERSON;
     person.emails.push(new EmailAddress(work, true, email));
     person.emails.push(new EmailAddress(home, true, email2));
     var errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.CONTACTS_EMAILS);
     expect(errors[0].message).eq(PartyValidator.MORE_THAN_ONE_PRIMARY_CONTACT);
     })
     });


     describe("When validating phones with no primary phone", function () {
     it("The method should return an error", function () {
     var person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = PartyValidator.PERSON;
     person.emails.push(new EmailAddress(work, true, email));
     person.phones.push(new PhoneNumber(home, false, phone, "", "", ""));
     person.phones.push(new PhoneNumber(work, false, phone2, "", "", ""));
     var errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.CONTACT_PHONE_NUMBER);
     expect(errors[0].message).eq(PartyValidator.NO_PRIMARY_CONTACT);
     })
     });

     describe("When validating phones with more than one phone marked as primary", function () {
     it("The method should return an error", function () {
     var person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = PartyValidator.PERSON;
     person.emails.push(new EmailAddress(work, true, email));
     person.phones.push(new PhoneNumber(home, true, phone, "", "", ""));
     person.phones.push(new PhoneNumber(work, true, phone2, "", "", ""));
     var errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.CONTACT_PHONE_NUMBER);
     expect(errors[0].message).eq(PartyValidator.MORE_THAN_ONE_PRIMARY_CONTACT);
     })
     });


     describe("When validating phones with no primary postal address", function () {
     it("The method should return an error", function () {
     var person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = PartyValidator.PERSON;
     person.emails.push(new EmailAddress(work, true, email));
     person.addresses.push(new PostalAddress(
     home,
     false,
     address,
     "",
     "",
     cityText,
     null,
     postalCode,
     stateText,
     null,
     countryIsoCode));
     person.addresses.push(new PostalAddress(
     work,
     false,
     address,
     "",
     "",
     cityText,
     null,
     postalCode,
     stateText,
     null,
     countryIsoCode));
     var errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.CONTACT_ADDRESSES);
     expect(errors[0].message).eq(PartyValidator.NO_PRIMARY_CONTACT);
     })
     });

     describe("When validating phones with more than one postal address marked as primary", function () {
     it("The method should return an error", function () {
     var person = new PersonEntity();
     person.idAccount = idAccount;
     person.displayName = displayName;
     person.name.first = name;
     person.name.middle = middleName;
     person.type = PartyValidator.PERSON;
     person.emails.push(new EmailAddress(work, true, email));
     person.addresses.push(new PostalAddress(
     home,
     true,
     address,
     "",
     "",
     cityText,
     null,
     postalCode,
     stateText,
     null,
     countryIsoCode));
     person.addresses.push(new PostalAddress(
     work,
     true,
     address,
     "",
     "",
     cityText,
     null,
     postalCode,
     stateText,
     null,
     countryIsoCode));
     var errors = PartyValidator.validateParty(person);
     expect(errors.length).eq(1);
     expect(errors[0].attribute).eq(PartyValidator.CONTACT_ADDRESSES);
     expect(errors[0].message).eq(PartyValidator.MORE_THAN_ONE_PRIMARY_CONTACT);
     })
     });*/
});
