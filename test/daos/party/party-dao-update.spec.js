/**
 * Project janux-persistence
 * Created by ernesto on 6/23/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');

var PartyValidator = require("../../../dist/index").PartyValidator;
var EmailAddress = require("janux-people").EmailAddress;
var PhoneNumber = require("janux-people").PhoneNumber;
var PersonEntity = require("janux-people").Person;
var OrganizationEntity = require("janux-people").Organization;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const idAccount = "313030303030303030303037";
const firstName = "John";
const middleName = "Doe";
const displayName = "Display name";
const lastName = "Iglesias";
const honorificPrefix = "honorificPrefix";
const honorificSuffix = "honorificSuffix";
const email = "glarus@mail.com";
const email3 = "glarus_dev@mail.com";
const email4 = "glarus_sys@mail.com";
const email5 = "glarus_admin@mail.com";
const work = "work";
const home = "home";
const phone = "55-55-55-55";

const organizationName = "Glarus";
const organizationName2 = "Glarus 2";

const name2 = "Jane";
const middleName2 = "Smith";
const newCodePerson = 'new code person';

describe("Testing party dao updateMethod methods", function () {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
		describe("Given the inserted records", function () {

			var insertedRecordOrganization;
			var insertedRecordPerson;
			var insertedRecordOrganization2;
			var insertedRecordPerson2;
			var partyDao;
			beforeEach(function (done) {
				var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
				partyDao = DaoUtil.createPartyDao(dbEngine, path)
				partyDao.removeAll()
					.then(function () {
						var organization = new OrganizationEntity();
						organization.idAccount = idAccount;
						organization.displayName = displayName;
						organization.name = organizationName;
						organization.type = PartyValidator.ORGANIZATION;
						organization.setContactMethod(work, new EmailAddress(email));

						var person = new PersonEntity();
						person.displayName = displayName;
						person.name.first = firstName;
						person.name.middle = middleName;
						person.name.last = lastName;
						person.type = PartyValidator.PERSON;
						person.setContactMethod(work, new EmailAddress(email3));

						var organization2 = new OrganizationEntity();
						organization2.displayName = displayName;
						organization2.name = organizationName2;
						organization2.type = PartyValidator.ORGANIZATION;
						organization2.setContactMethod(work, new EmailAddress(email4));

						var person2 = new PersonEntity();
						person2.displayName = displayName;
						person2.name.first = name2;
						person2.name.middle = middleName2;
						person2.type = PartyValidator.PERSON;
						person2.setContactMethod(work, new EmailAddress(email5));

						return partyDao.insertMany([organization, person, organization2, person2])
					})
					.then(function (result) {
						insertedRecordOrganization = result[0];
						insertedRecordPerson = result[1];
						insertedRecordOrganization2 = result[2];
						insertedRecordPerson2 = result[3];
						done();
					})
					.catch(function (err) {
						assert.fail("Error", err);
						done();
					})
			});


			// describe("When updating a party with a duplicated email", function () {
			//     it("The method should return an error", function (done) {
			//         insertedRecordPerson.emails.push(new EmailAddress(home, false, email));
			//         partyDao.updateMethod(insertedRecordPerson)
			//             .then(function (updatedRecord) {
			//                 expect.fail("The method should not have updated the record");
			//                 done();
			//             })
			//             .catch(function (err) {
			//                 expect(err.length).eq(1);
			//                 done();
			//             })
			//     })
			// });


			// describe("When updating a party with invalid info", function () {
			//     it("The method should return an error", function (done) {
			//         insertedRecordPerson.emails.push(new EmailAddress(work, true, invalidEmail));
			//         partyDao.updateMethod(insertedRecordPerson)
			//             .then(function (updatedRecord) {
			//                 expect.fail("The method should not have updated the record");
			//                 done();
			//             })
			//             .catch(function (err) {
			//                 expect(err.length).eq(2);
			//                 done();
			//             })
			//     })
			// });

			// describe("When updating an organization with a duplicated name", function () {
			//     it("The method should return an error", function (done) {
			//         insertedRecordOrganization2.name = organizationName;
			//         partyDao.updateMethod(insertedRecordOrganization2)
			//             .then(function (updatedRecord) {
			//                 expect.fail("The method should not have updated the record");
			//                 done();
			//             })
			//             .catch(function (err) {
			//                 expect(err.length).eq(1);
			//                 expect(err[0].attribute).eq(OrganizationValidator.ATTRIBUTES);
			//                 expect(err[0].message).eq(OrganizationValidator.CODE_DUPLICATED);
			//                 expect(err[0].value).eq(organizationName);
			//                 done();
			//             })
			//     });
			// });


			// describe("When updating a person with a duplicated name", function () {
			//     it("The method should return an error", function (done) {
			//         insertedRecordPerson2.name.first = firstName;
			//         insertedRecordPerson2.name.middle = middleName;
			//         insertedRecordPerson2.name.last = lastName;
			//         partyDao.updateMethod(insertedRecordPerson2)
			//             .then(function (updatedRecord) {
			//                 expect.fail("The method should not have updated the record");
			//                 done();
			//             })
			//             .catch(function (err) {
			//                 expect(err.length).eq(1);
			//                 expect(err[0].attribute).eq(PersonValidator.ATTRIBUTES);
			//                 expect(err[0].message).eq(PersonValidator.PERSON_NAME_DUPLICATED);
			//                 done();
			//             })
			//     });
			// });

			describe("When updating a party with the correct info", function () {
				it("The method should not return an error", function (done) {
					insertedRecordPerson2.setContactMethod(work, new PhoneNumber(phone));
					insertedRecordPerson2.code = newCodePerson;
					partyDao.update(insertedRecordPerson2)
						.then(function (result) {
							expect(result.id).not.to.be.undefined;
							expect(result.code).eq(newCodePerson);
							expect(result.phoneNumbers(false).length).eq(1);
							done();
						})
						.catch(function (err) {
							expect.fail("Error");
							done();
						})
				});
			});
		});
	});
});
