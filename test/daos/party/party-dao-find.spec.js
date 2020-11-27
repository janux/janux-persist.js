/**
 * Project janux-persistence
 * Created by ernesto on 6/23/17.
 */
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var MockDate = require("mockdate");
var config = require("config");

var PartyValidator = require("../../../dist/index").PartyValidator;
var EmailAddress = require("janux-people").EmailAddress;
var PhoneNumber = require("janux-people").PhoneNumber;
var PersonEntity = require("janux-people").Person;
var OrganizationEntity = require("janux-people").Organization;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

var i = 0;

const {	eachTest, last30Days, last90Days, oneYear, yearToDate, fiveYearToDate, deleteLokiDB, makeMail } = require('./date-utils');
const { firstName, middleName, lastName, maternal, work, organizationName1 } = require('./date-utils');
const { organizationName2, name2, middleName2, invalidId1, invalidId2, functions, functions2, M, L } = require('./date-utils');

describe.only("Testing party dao find period method", function() {
	[DataSourceHandler.LOKIJS, DataSourceHandler.MONGOOSE].forEach((dbEngine) => {
		describe("Given the inserted records", function() {
			var insertedRecordOrganization1;
			var insertedRecordOrganization2;
			var insertedRecordPerson1;
			var insertedRecordPerson2;
			var partyDao;
			const isMongoose = () => {
				if (dbEngine === DataSourceHandler.MONGOOSE) {
					return true;
				}
			}

			beforeEach(function(done) {
				if (!isMongoose()) {
					deleteLokiDB();
				} 
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
						if (dbEngine === DataSourceHandler.LOKIJS) { 
							organization1.type = PartyValidator.ORGANIZATION;
							organization1.setContactMethod(work, new EmailAddress(makeMail()));
						}

						var person1 = new PersonEntity();
						person1.name.first = firstName;
						person1.name.middle = middleName;
						person1.name.last = lastName;
						person1.name.maternal = maternal;
						person1.isReseller = true;
						person1.functionsProvided = functions;
						if (dbEngine === DataSourceHandler.LOKIJS) { 
							person1.type = PartyValidator.PERSON;
							person1.setContactMethod(work, new EmailAddress(makeMail()));
						}

						var organization2 = new OrganizationEntity();
						organization2.name = organizationName2;
						if (dbEngine === DataSourceHandler.LOKIJS) { 
							organization2.type = PartyValidator.ORGANIZATION;
							organization2.setContactMethod(work, new EmailAddress(makeMail()));
						}
						
						var person2 = new PersonEntity();
						person2.name.first = name2;
						person2.name.middle = middleName2;
						person2.isSupplier = true;
						person2.functionsProvided = functions2;
						if (dbEngine === DataSourceHandler.LOKIJS) { 
							person2.type = PartyValidator.PERSON;
							person2.setContactMethod(work, new EmailAddress(makeMail()));
						}
						MockDate.set(eachTest[i > 5 ? 1 : i].creationTime);
						
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
						MockDate.set(eachTest[i > 5 ? 1 : i].updateTime);
						i > 11 ? i = 0 : i++;
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

			describe(`${isMongoose() ? M : L} When calling a period last30Days`, function() {
				it("The method should return 1 PERSON record", function(done) {
					MockDate.reset();
					partyDao
						.findPeopleByPeriod({ from: last30Days.from(), to: last30Days.to() }).then(function(result) {
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});
			});

			describe(`${isMongoose() ? M : L} When calling a period last90Days`, function() {
				it("The method should return 1 PERSON record ", function(done) {
					MockDate.reset();
					partyDao
						.findPeopleByPeriod({ from: last90Days.from(), to: last90Days.to() }).then(function(result) {
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});
			});

			describe(`${isMongoose() ? M : L} When calling a period in oneYear`, function() {
				it("The method should return 1 PERSON record", function(done) {
					MockDate.reset();
					partyDao
						.findPeopleByPeriod({ from: oneYear.from(), to: oneYear.to() }).then(function(result) {
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});
			});

			describe(`${isMongoose() ? M : L} When calling a period in yearToDate`, function() {
				it("The method should return 1 PERSON record", function(done) {
					MockDate.reset();
					partyDao
						.findPeopleByPeriod({ from: yearToDate.from(), to: yearToDate.to() }).then(function(result) {
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});
			});

			describe(`${isMongoose() ? M : L} When calling  a period of fiveYearToDate`, function() {
				it("The method should return 1 PERSON record", function(done) {
					MockDate.reset();
					partyDao
						.findPeopleByPeriod({ from: fiveYearToDate.from(), to: fiveYearToDate.to() }).then(function(result) {
							expect(result.length).eq(1);
							expect(result[0].id).not.to.be.undefined;
							expect(result[0].typeName).eq(PartyValidator.PERSON);
							done();
					})
				});
			});

			describe(`${isMongoose() ? M : L} When calling fiveYearToDate out of period`, function() {
				it("The method should return 0 record", function(done) {
					MockDate.reset();
					partyDao.
						findPeopleByPeriod({ from: fiveYearToDate.from(), to: fiveYearToDate.to() }).then(function(result) {
							expect(result.length).eq(0);
							done();
					})
				});
			});

			describe(`${isMongoose() ? M : L} When calling findPeople`, function() {
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

			describe(`${isMongoose() ? M : L} When calling findOrganizations`, function() {
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

			describe(`${isMongoose() ? M : L} When calling the method findByIdsMethod`, function() {
				it("The method should return one record", function(done) {
					partyDao
						.findByIdsMethod([invalidId1, invalidId2, insertedRecordOrganization2.id])
						.then(function(result) {
							expect(result.length).eq(1);
							done();
						});
				});
			});

			describe(`${isMongoose() ? M : L} When calling findOneMethod`, function() {
				it("The method should return one record when calling by a inserted id", function(done) {
					partyDao.findOne(insertedRecordOrganization2.id).then(function(result) {
						expect(result).not.to.be.null;
						expect(result.id).eq(insertedRecordOrganization2.id);
						expect(result.name).not.to.be.null;
						done();
					});
				});

				it(`The method should return null with an invalid id`, function(done) {
					partyDao.findOne(invalidId1).then(function(result) {
						expect(result).to.be.null;
						done();
					});
				});
			});

			describe(`${isMongoose() ? M : L} When calling find findByIsSupplierAndTypeName`, function() {
				it("The method should return one record", function(done) {
					partyDao.findByIsSupplierAndTypeName(true, PartyValidator.ORGANIZATION).then(function(value) {
						expect(value.length).eq(1);
						done();
					});
				});
			});

			describe(`${isMongoose() ? M : L} When calling findByIdsAndFunctionsProvided`, function() {
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
