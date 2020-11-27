/**
 * Project janux-persistence
 * Created by ernesto on 6/23/17.
 */
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var config = require("config");
var lokijs = require("lokijs");
var mongoose = require("mongoose");
var moment = require("moment");
var MockDate = require("mockdate");
var uuidv1 = require('uuid');
const fs = require('fs');

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
const lastName = "Iglesias";
const displayName = "displayName";
const honorificPrefix = "honorificPrefix";
const honorificSuffix = "honorificSuffix";
const work = "work";
const home = "home";
const email1 = "glarus@mail.com";
const email2 = "glarus_dev@mail.com";
const email3 = "glarus_sys@mail.com";
const email4 = "glarus_admin@mail.com";
var invalidId1 = "313030303030303030303030";
var invalidId2 = "313030303030303030303032";
var functions = ["FUNCTION-1", "FUNCTION_2"];
var functions2 = ["FUNCTION_2", "FUNCTION_4"];
const organizationName1 = "Glarus";
const organizationName2 = "Glarus 2";

// const makeMail = () => {
// 	// console.log('uuidv1', uuidv1())
// 	return 'user' + uuidv1() + '@' + uuidv1() + '.com';
// }

const name2 = "Jane";
const middleName2 = "Smith";

const { eachTest, last30Days, last90Days, oneYear, yearToDate, fiveYearToDate } = require('./date-utils');

const deleteLokiDB = () => {
	let db = process.cwd()+'/janux-persistence-test.db';
		fs.unlink(db, function (err) {
			if (err) throw err;
			// if no error, file has been deleted successfully
			console.log('db file deleted!');
		});  
}
var i = 0;

describe("Testing party dao find by Period Loki methods", function() {
	// [DataSourceHandler.MONGOOSE].forEach((dbEngine) => {
	[DataSourceHandler.LOKIJS].forEach((dbEngine, dbType) => {
		describe("Given the inserted records", function() {
			var partyDao;
			var insertedRecordOrganization1;
			var insertedRecordPerson1;
			var insertedRecordOrganization2;
			var insertedRecordPerson2;

			beforeEach(function(done) {
				deleteLokiDB();
				console.log('______________________>');
				console.log('i value is: ', i);
				var path =
					dbEngine === DataSourceHandler.LOKIJS
						? serverAppContext.db.lokiJsDBPath
						: serverAppContext.db.mongoConnUrl;
				partyDao = DaoUtil.createPartyDao(dbEngine, path);
				partyDao
					.removeAll()
					.then(function() {
						var organization1 = new OrganizationEntity();
						organization1.isSupplier = true;
						organization1.idAccount = idAccount;
						organization1.name = organizationName1;
						organization1.type = PartyValidator.ORGANIZATION;
						organization1.setContactMethod(work, new EmailAddress(email1));

						var person1 = new PersonEntity();
						person1.name.first = firstName;
						person1.name.middle = middleName;
						person1.name.last = lastName;
						person1.type = PartyValidator.PERSON;
						person1.setContactMethod(work, new EmailAddress(email2));

						var organization2 = new OrganizationEntity();
						organization2.name = organizationName2;
						organization2.type = PartyValidator.ORGANIZATION;
						organization2.setContactMethod(work, new EmailAddress(email3));

						var person2 = new PersonEntity();
						person2.name.first = name2;
						person2.name.middle = middleName2;
						person2.type = PartyValidator.PERSON;
						person2.setContactMethod(work, new EmailAddress(email4));

						MockDate.set(eachTest[i > 5 ? 1 : i].creationTime); // set lastUpdate
						
						return partyDao.insertMany([organization1, person1, organization2, person2]);
					})
					.then(function(result) {
						insertedRecordOrganization1 = result[0];
						insertedRecordPerson1 = result[1];
						insertedRecordOrganization2 = result[2];
						insertedRecordPerson2 = result[3];
						done();
					})
					.then((done) => {
						MockDate.set(eachTest[i > 5 ? 1 : i].updateTime); // set lastUpdate
						i++;
						insertedRecordOrganization1.code = 7;
						insertedRecordPerson1.code = 8;
						return [
							partyDao.update(insertedRecordPerson1),
							partyDao.update(insertedRecordOrganization1)
							.catch(function(err) {
								console.log(err);
								expect.fail("Error");
								done();
							})
						]
					})
					.catch(function(err) {
						console.log(err)
						assert.fail("Error", err);
						done();
					});
			});

			describe("When calling findPeopleByPeriod in last30Days period", function() {
				MockDate.reset();
				it("Last30Days It should return 1 record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: last30Days.from(), to: last30Days.to() })
						.then((result) => {
							// result.map((result) => {
							// 	console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							// })
							// console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});
			});

			describe("When calling findPeopleByPeriod in last90Days period", function() {
				MockDate.reset();
				it("Last90Days It should return 1 record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: last90Days.from(), to: last90Days.to() })
						.then((result) => {
							// result.map((result) => {
							// 	console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							// })
							// console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});
			});

			describe("When calling findPeopleByPeriod in oneYear period", function() {
				MockDate.reset();
				it("OneYear It should return 1 record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: oneYear.from(), to: oneYear.to() })
						.then((result) => {
							// result.map((result) => {
							// 	console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							// })
							// console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});
			});

			describe("When calling findPeopleByPeriod in yearToDate period", function() {
				MockDate.reset();
				it("YearToDate It should return 1 record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: yearToDate.from(), to: yearToDate.to() })
						.then((result) => {
							// result.map((result) => {
							// 	console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							// })
							// console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});
			});

			describe("When calling findPeopleByPeriod in fiveYearToDate period", function() {
				it("FiveYearToDate It should return 1 record", function(done) {
					// console.log(`today was: ${moment()}`);
					MockDate.reset();
					// console.log(`today is: ${moment()}`);
					// console.log(`created date: ${eachTest[i].creationTime}`);
					// console.log(`updated date: ${eachTest[i].updateTime}`);
					partyDao
						.findPeopleByPeriod({ from: fiveYearToDate.from(), to: fiveYearToDate.to() })
						.then((result) => {
							// console.log()
							// result.map((result) => {
							// 	console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							// })
							// // console.log(`res : ${result} `);
							// console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});

				it("fiveYearToDate The method should return 0 record", function(done) {
					MockDate.reset();
					partyDao.
						findPeopleByPeriod({ from: fiveYearToDate.from(), to: fiveYearToDate.to() }).then(function(result) {
							// result.map((result) => {
							// 	console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							// })
							// console.log(`res : ${result} `);
							// console.log(`res length: ${result.length} `);
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
