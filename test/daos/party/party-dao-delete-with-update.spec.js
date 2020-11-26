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

const organizationName = "Glarus";
const organizationName2 = "Glarus 2";

const name2 = "Jane";
const middleName2 = "Smith";

const { eachTest, last30Days, last90Days, oneYear, yearToDate, fiveYearToDate } = require('./date-utils');

describe("Testing party dao delete methods", function() {
	[DataSourceHandler.LOKIJS].forEach(function(dbEngine) {
		describe("Given the inserted records", function() {
			var partyDao;
			var insertedRecordOrganization;
			var insertedRecordPerson;
			var insertedRecordOrganization2;
			var insertedRecordPerson2;

			beforeEach(function(done) {
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
						organization.setContactMethod(work, new EmailAddress(email));

						var person = new PersonEntity();
						person.name.first = firstName;
						person.name.middle = middleName;
						person.name.last = lastName;
						person.type = PartyValidator.PERSON;
						person.setContactMethod(work, new EmailAddress(email3));

						var organization2 = new OrganizationEntity();
						organization2.name = organizationName2;
						organization2.type = PartyValidator.ORGANIZATION;
						organization2.setContactMethod(work, new EmailAddress(email4));

						var person2 = new PersonEntity();
						person2.name.first = name2;
						person2.name.middle = middleName2;
						person2.type = PartyValidator.PERSON;
						person2.setContactMethod(work, new EmailAddress(email5));

						return partyDao.insertMany([organization, person, organization2, person2]);
					})
					.then(function(result) {
						insertedRecordOrganization = result[0];
						insertedRecordPerson = result[1];
						insertedRecordOrganization2 = result[2];
						insertedRecordPerson2 = result[3];
						done();
					})
					.catch(function(err) {
						console.log(err)
						assert.fail("Error", err);
						done();
					});
			});

			describe("When calling delete all 2", function() {
				it("It should delete all records 2", function(done) {
					partyDao.update(insertedRecordOrganization)
					.then(() => {
						return partyDao
							.findPeopleByPeriod({ from: last30Days.from(), to: last30Days.to() })
							.then((r) => {
								console.log('result', r)
								return partyDao
									.removeAll()
									.then(function() {
										return partyDao.count();
									})
									
									.then(function(count) {
										expect(count).eq(0);
										done();
									});
							})
					})
					
					
				});
			});


			// describe("When deleting one record", function() {
			// 	it("It should delete it", function(done) {
			// 		partyDao
			// 			.remove(insertedRecordOrganization)
			// 			.then(function() {
			// 				return partyDao.count();
			// 			})
			// 			.then(function(count) {
			// 				expect(count).eq(3);
			// 				done();
			// 			});
			// 	});
			// });
		});
	});
});
