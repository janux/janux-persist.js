/**
 * Project janux-persistence
 * Created by ernesto on 6/23/17.
 */
var chai = require("chai");
const fs = require('fs');
var expect = chai.expect;
var assert = chai.assert;
var MockDate = require("mockdate");
var config = require("config");
var uuidv1 = require('uuid');

var PartyValidator = require("../../../dist/index").PartyValidator;
var EmailAddress = require("janux-people").EmailAddress;
var PhoneNumber = require("janux-people").PhoneNumber;
var PersonEntity = require("janux-people").Person;
var OrganizationEntity = require("janux-people").Organization;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const firstName = "John";
const middleName = "Doe";

const lastName = "Iglesias";
const maternal = "Smith";

const honorificPrefix = "honorificPrefix";
const honorificSuffix = "honorificSuffix";

const work = "work";
const home = "home";

const organizationName1 = "Glarus";
const organizationName2 = "Glarus 2";

const name2 = "Jane";
const middleName2 = "Smith";

var invalidId1 = "313030303030303030303030";
var invalidId2 = "313030303030303030303032";
var functions = ["FUNCTION-1", "FUNCTION_2"];
var functions2 = ["FUNCTION_2", "FUNCTION_4"];

const makeMail = () => {
	// console.log('uuidv1', uuidv1())
	return 'user' + uuidv1() + '@' + uuidv1() + '.com';
}

var isReseller = false;
var newCodePerson = 'new code';


const { eachTest, last30Days, last90Days, oneYear, yearToDate, fiveYearToDate } = require('./date-utils');

describe("Testing party dao find period method", function() {
	// [DataSourceHandler.MONGOOSE].forEach((dbEngine) => {
	// [DataSourceHandler.LOKIJS].forEach((dbEngine) => {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach((dbEngine) => {
		describe("Given the inserted records", function() {
			var insertedRecordOrganization1;
			var insertedRecordOrganization2;
			var insertedRecordPerson1;
			var insertedRecordPerson2;
			var partyDao;
			var i = 0;

			beforeEach(function(done) {
				var path =
					dbEngine === DataSourceHandler.LOKIJS
						? serverAppContext.db.lokiJsDBPath
						: serverAppContext.db.mongoConnUrl;
				partyDao = DaoUtil.createPartyDao(dbEngine, path);
				partyDao
					.removeAll()
					.then(function() {
						var organization1 = new OrganizationEntity();
						organization1.name = organizationName1;
						organization1.isSupplier = true;
						organization1.type = PartyValidator.ORGANIZATION;
						organization1.setContactMethod(work, new EmailAddress(makeMail()));

						var person1 = new PersonEntity();
						person1.name.first = firstName;
						person1.name.middle = middleName;
						person1.name.last = lastName;
						person1.name.maternal = maternal;
						person1.isReseller = true;
						person1.functionsProvided = functions;
						person1.type = PartyValidator.PERSON;
						person1.setContactMethod(work, new EmailAddress(makeMail()));

						var organization2 = new OrganizationEntity();
						organization2.name = organizationName2;
						organization2.type = PartyValidator.ORGANIZATION;
						organization2.setContactMethod(work, new EmailAddress(makeMail()));

						var person2 = new PersonEntity();
						person2.name.first = name2;
						person2.name.middle = middleName2;
						person2.isSupplier = true;
						person2.functionsProvided = functions2;
						person2.type = PartyValidator.PERSON;
						person2.setContactMethod(work, new EmailAddress(makeMail()));

						MockDate.set(eachTest[i].creationTime); // set lastUpdate

						return partyDao.insertMany([organization1, person1, organization2, person2]);
					})
					.then(function(result) {
						insertedRecordOrganization1 = result[0];
						insertedRecordPerson1 = result[1];
						insertedRecordOrganization2 = result[2];
						insertedRecordPerson2 = result[3];
						done();
					})
					// .then((done) => {
					// 	MockDate.set(eachTest[i].updateTime); // set lastUpdate
					// 	console.log('value of i: ', i)
					// 	i++;
					// 	insertedRecordOrganization1.code = 7;
					// 	insertedRecordPerson1.code = 8;
					// 	return [
					// 		partyDao.update(insertedRecordOrganization1),
					// 		partyDao.update(insertedRecordPerson1),
					// 		MockDate.reset(),
					// 		done()
					// 	]
					// })
					.catch(function(err) {
						assert(false);
						console.log(err);
						done(err);
					});
			});

			describe.only("When calling findPeopleByPeriod last30Days", function() {
				it("<last30Days 1 PartyValidator.PERSON>", function(done) {
					MockDate.set(eachTest[i].updateTime); // set lastUpdate
					i++;
					insertedRecordOrganization1.code = newCodePerson;
					insertedRecordPerson2.code = newCodePerson;
					partyDao
						.update(insertedRecordPerson2)
						.then(() => {
							return partyDao.update(insertedRecordOrganization1)
							.then(() => {
								return partyDao
									.findPeopleByPeriod({ from: last30Days.from(), to: last30Days.to() }).then(function(result) {
										console.log(`from: ${last30Days.from()} to: ${last30Days.to()}`)
										console.log(`res: ${result} `)
										console.log(`res length: ${result.length} `)
										// expect(result.length).eq(1);
										// expect(result[0].id).not.to.be.undefined;
										// expect(result[0].typeName).eq(PartyValidator.PERSON);
										MockDate.reset();
										done();
								})
							})
							.catch(function(err) {
								console.log(err);
								expect.fail("Error");
								done();
							});
						})
						.catch(function(err) {
							console.log(err);
							assert.fail(err);
							// expect.fail("Error");
							done(err);
						});
					// partyDao
					// 	.findPeopleByPeriod({ from: last30Days.from(), to: last30Days.to() }).then(function(result) {
					// 		console.log(`from: ${last30Days.from()} to: ${last30Days.to()}`)
					// 		console.log(`res: ${result} `)
					// 		console.log(`res length: ${result.length} `)
					// 		// expect(result.length).eq(1);
					// 		// expect(result[0].id).not.to.be.undefined;
					// 		// expect(result[0].typeName).eq(PartyValidator.PERSON);
					// 		done();
					// })
				});
			});

			describe("When calling findPeopleByPeriod last90Days", function() {
				it("The method should return 1 PartyValidator.PERSON record ", function(done) {
					partyDao
						.findPeopleByPeriod({ from: last90Days.from(), to: last90Days.to() }).then(function(result) {
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});
			});

			describe("When calling findPeopleByPeriod in oneYear", function() {
				it("The method should return 1 PartyValidator.PERSON record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: oneYear.from(), to: oneYear.to() }).then(function(result) {
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});
			});

			describe("When calling findPeopleByPeriod in yearToDate", function() {
				it("The method should return 1 PartyValidator.PERSON record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: yearToDate.from(), to: yearToDate.to() }).then(function(result) {
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});
			});

			describe("When calling findPeopleByPeriod fiveYearToDate", function() {
				it("The method should return 1 PartyValidator.PERSON record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: fiveYearToDate.from(), to: fiveYearToDate.to() }).then(function(result) {
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});

				it("The method should return 0 record", function(done) {
					partyDao.
						findPeopleByPeriod({ from: fiveYearToDate.from(), to: fiveYearToDate.to() }).then(function(result) {
							expect(result.length).eq(0);
							done();
					})
				});
			});

			describe("When calling findPeople", function() {
				it("The method should return 2 records", function(done) {
					partyDao
						.findPeople().then(function(result) {
							expect(result.length).eq(2);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							expect(result[1].id).not.to.be.undefined;
							expect(result[1].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});
			});

			describe("When calling findOrganizations", function() {
				it("The method should return 2 records", function(done) {
					partyDao
						.findOrganizations().then(function(result) {
							expect(result.length).eq(2);
							expect(result[0].typeName).eq(PartyValidator.ORGANIZATION);
							expect(result[1].typeName).eq(PartyValidator.ORGANIZATION);
							done();
					});
				});
			});

			describe("When calling the method findByIdsMethod", function() {
				it("The method should return one record", function(done) {
					partyDao
						.findByIdsMethod([invalidId1, invalidId2, insertedRecordOrganization2.id])
						.then(function(result) {
							expect(result.length).eq(1);
							done();
						});
				});
			});

			describe("When calling findOneMethod", function() {
				it("The method should return one record when calling by a inserted id", function(done) {
					partyDao.findOne(insertedRecordOrganization2.id).then(function(result) {
						expect(result).not.to.be.null;
						expect(result.id).eq(insertedRecordOrganization2.id);
						expect(result.name).not.to.be.null;
						done();
					});
				});

				it("The method should return null with an invalid id", function(done) {
					partyDao.findOne(invalidId1).then(function(result) {
						expect(result).to.be.null;
						done();
					});
				});
			});

			describe("When calling find findByIsSupplierAndTypeName", function() {
				it("The method should return one record", function(done) {
					partyDao.findByIsSupplierAndTypeName(true, PartyValidator.ORGANIZATION).then(function(value) {
						expect(value.length).eq(1);
						done();
					});
				});
			});

			describe("When calling findByIdsAndFunctionsProvided", function() {
				it("The method should return the result", function(done) {
					// The method only works for mongodb
					if (dbEngine === DataSourceHandler.LOKIJS) {
						done();
					}
					partyDao
						.findByIdsAndFunctionsProvided(
							[
								insertedRecordOrganization1.id,
								insertedRecordOrganization2.id,
								insertedRecordPerson1.id,
								insertedRecordPerson2.id
							],
							["FUNCTION_2", "BLA"]
						)
						.then(function(value) {
							expect(value.length).eq(2);
							done();
						});
				});
			});
		});
	});
});
