/**
 * Project janux-persistence
 * Created by ernesto on 6/23/17.
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");

var PartyValidator = require("../../../../dist/index").PartyValidator;
var EmailAddress = require("janux-people").EmailAddress;
var PhoneNumber = require("janux-people").PhoneNumber;
var StaffImpl = require("../../../../dist/index").StaffImplTest;
var DaoUtil = require("../../dao-util");
var DataSourceHandler = require("../../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const firstName = "John";
const middleName = "Doe";
const displayName = "Display name";
const lastName = "Iglesias";
const honorificSuffix = "honorificSuffix";
const email1 = "glarus_dev@mail.com";
const email2 = "glarus_admin@mail.com";
const work = "work";
const home = "home";
const phone = "55-55-55-55";
const contractNumber1 = "122-226-21d";
const contractNumber2 = "122-212-22t";
const earning1 = 100000;
const earning2 = 200000;

const name2 = "Jane";
const middleName2 = "Smith";

describe("Testing party dao updateMethod methods", function() {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function(dbEngine) {
		describe("Given the inserted records", function() {
			var insertedRecordStaff;
			var insertedRecordStaff2;
			var partyDao;
			beforeEach(function(done) {
				var path =
					dbEngine === DataSourceHandler.LOKIJS
						? serverAppContext.db.lokiJsDBPath
						: serverAppContext.db.mongoConnUrl;
				partyDao = DaoUtil.createPartyDao(dbEngine, path);

				setTimeout(function(args) {
					partyDao
						.removeAll()
						.then(function() {
							var staff1 = new StaffImpl();
							staff1.displayName = displayName;
							staff1.name.first = firstName;
							staff1.name.middle = middleName;
							staff1.name.last = lastName;
							staff1.type = PartyValidator.PERSON;
							staff1.contractNumber = contractNumber1;
							staff1.currentEarnings = earning1;
							staff1.setContactMethod(work, new EmailAddress(email1));

							var staff2 = new StaffImpl();
							staff2.displayName = displayName;
							staff2.name.first = name2;
							staff2.name.middle = middleName2;
							staff2.type = PartyValidator.PERSON;
							staff2.contractNumber = contractNumber2;
							staff2.currentEarnings = earning2;
							staff2.setContactMethod(work, new EmailAddress(email2));

							return partyDao.insertMany([staff1, staff2]);
						})
						.then(function(result) {
							insertedRecordStaff = result[0];
							insertedRecordStaff2 = result[1];
							done();
						});
				}, 50);
			});

			describe("When updating a party with the correct info", function() {
				it("The method should not return an error", function(done) {
					insertedRecordStaff.setContactMethod(work, new PhoneNumber(phone));
					partyDao.update(insertedRecordStaff).then(function(result) {
						expect(result.id).not.to.be.undefined;
						expect(result.phoneNumbers(false).length).eq(1);
						expect(result.contractNumber).eq(contractNumber1);
						done();
					});
				});
			});
		});
	});
});
