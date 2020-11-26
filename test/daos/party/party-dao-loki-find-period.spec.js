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

var PersonEntity = require("janux-people").Person;
var EmailAddress = require("janux-people").EmailAddress;
var PartyValidator = require("../../../dist/index").PartyValidator;
var PhoneNumber = require("janux-people").PhoneNumber;
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
const email = "glarus@mail.com";
const email3 = "glarus_dev@mail.com";
const email4 = "glarus_sys@mail.com";
const email5 = "glarus_admin@mail.com";

const makeMail = () => {
	// console.log('uuidv1', uuidv1())
	return 'user' + uuidv1() + '@' + uuidv1() + '.com';
}

const organizationName = "Glarus";
const organizationName2 = "Glarus 2";

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
			var insertedRecordOrganization;
			var insertedRecordPerson;
			var insertedRecordOrganization2;
			var insertedRecordPerson2;

			beforeEach(function(done) {
				deleteLokiDB();
				console.log('i value is: ', i);
				var path =
					dbEngine === DataSourceHandler.LOKIJS
						? serverAppContext.db.lokiJsDBPath
						: serverAppContext.db.mongoConnUrl;
				partyDao = DaoUtil.createPartyDao(dbEngine, path);
				partyDao
					.removeAll()
					.then(function() {
						var organization = new OrganizationEntity();
						organization.idAccount = idAccount;
						organization.name = organizationName;
						organization.type = PartyValidator.ORGANIZATION;
						organization.setContactMethod(work, new EmailAddress(makeMail()));

						var person = new PersonEntity();
						person.name.first = firstName;
						person.name.middle = middleName;
						person.name.last = lastName;
						person.type = PartyValidator.PERSON;
						person.setContactMethod(work, new EmailAddress(makeMail()));

						var organization2 = new OrganizationEntity();
						organization2.name = organizationName2;
						organization2.type = PartyValidator.ORGANIZATION;
						organization2.setContactMethod(work, new EmailAddress(makeMail()));

						var person2 = new PersonEntity();
						person2.name.first = name2;
						person2.name.middle = middleName2;
						person2.type = PartyValidator.PERSON;
						person2.setContactMethod(work, new EmailAddress(makeMail()));

						MockDate.set(eachTest[i].creationTime); // set lastUpdate
						
						return partyDao.insertMany([organization, person, organization2, person2]);
					})
					.then(function(result) {
						insertedRecordOrganization = result[0];
						insertedRecordPerson = result[1];
						insertedRecordOrganization2 = result[2];
						insertedRecordPerson2 = result[3];
						done();
					})
					.then((done) => {
						MockDate.set(eachTest[i].updateTime); // set lastUpdate
						i++;
						insertedRecordOrganization.code = 7;
						insertedRecordPerson.code = 8;
						return [
							partyDao.update(insertedRecordPerson),
							partyDao.update(insertedRecordOrganization)
							.catch(function(err) {
								console.log(err);
								expect.fail("Error");
								done();
							})
						]
						// .then(() => {
						// 	return partyDao.update(insertedRecordOrganization)
						// 	.catch(function(err) {
						// 		console.log(err);
						// 		expect.fail("Error");
						// 		done();
						// 	});
						// })
					})
					.catch(function(err) {
						console.log(err)
						assert.fail("Error", err);
						done();
					});
			});

			describe("When calling findPeopleByPeriod in last30Days period", function() {
				MockDate.reset();
				it("It should return 1 record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: last30Days.from(), to: last30Days.to() })
						.then((result) => {
							result.map((result) => {
								console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							})
							console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});
			});

			describe("When calling findPeopleByPeriod in last90Days period", function() {
				MockDate.reset();
				it("It should return 1 record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: last90Days.from(), to: last90Days.to() })
						.then((result) => {
							result.map((result) => {
								console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							})
							console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});
			});

			describe("When calling findPeopleByPeriod in oneYear period", function() {
				MockDate.reset();
				it("It should return 1 record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: oneYear.from(), to: oneYear.to() })
						.then((result) => {
							result.map((result) => {
								console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							})
							console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});
			});

			describe("When calling findPeopleByPeriod in yearToDate period", function() {
				MockDate.reset();
				it("It should return 1 record", function(done) {
					partyDao
						.findPeopleByPeriod({ from: yearToDate.from(), to: yearToDate.to() })
						.then((result) => {
							result.map((result) => {
								console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							})
							console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});
			});

			describe("When calling findPeopleByPeriod in fiveYearToDate period", function() {
				it("It should return 1 record", function(done) {
					console.log(`today was: ${moment()}`);
					MockDate.reset();
					console.log(`today is: ${moment()}`);
					console.log(`created date: ${eachTest[i].creationTime}`);
					console.log(`updated date: ${eachTest[i].updateTime}`);
					partyDao
						.findPeopleByPeriod({ from: fiveYearToDate.from(), to: fiveYearToDate.to() })
						.then((result) => {
							console.log()
							result.map((result) => {
								console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							})
							// console.log(`res : ${result} `);
							console.log(`res length: ${result.length} `);
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
						})
				});

				it("The method should return 0 record", function(done) {
					MockDate.reset();
					partyDao.
						findPeopleByPeriod({ from: fiveYearToDate.from(), to: fiveYearToDate.to() }).then(function(result) {
							result.map((result) => {
								console.log(`Created: ${result.dateCreated}, Updated: ${result.lastUpdate}`);
							})
							console.log(`res : ${result} `);
							console.log(`res length: ${result.length} `);
							expect(result.length).eq(0);
							done();
					})
				});

			});

		});
	});
});
