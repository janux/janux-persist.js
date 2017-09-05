/**
 * Project janux-persistence
 * Created by ernesto on 6/29/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var UserService = require("../../../dist/index").UserService;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var AccountValidator = require("../../../dist/index").AccountValidator;
var SampleData = require("../../util/sample-data");
var DaoFactory = require("../../../dist/index").DaoFactory;
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

var invalidId1 = "313030303030303030303030";


describe("Testing user service service insertMethod method", function () {
	describe("Given the inserted contacts", function () {
		var insertedParty1;
		var insertedParty2;
		var partyDao;
		var accountDao;
		var userService;

		beforeEach(function (done) {
			partyDao = DaoFactory.createPartyDao(dbEngine, dbPath);
			accountDao = DaoFactory.createAccountDao(dbEngine, dbPath);
			userService = UserService.createInstance(accountDao, partyDao);
			setTimeout(function () {
				accountDao.removeAll()
					.then(function () {
						return partyDao.removeAll();
					})
					.then(function () {
						// Inserting one person
						var person = SampleData.createPerson1();
						return partyDao.insert(person);
					})
					.then(function (insertedPerson) {
						insertedParty1 = insertedPerson;
						//Inserting organization
						var organization = SampleData.createOrganization1();
						return partyDao.insert(organization);
					})
					.then(function (insertedOrganization) {
						insertedParty2 = insertedOrganization;
						done();
					});
			}, 10);
		});


		describe("When inserting an correct account with an contact id", function () {
			it("It should not return any error", function (done) {
				var temporalAccount;
				var contactReference = insertedParty1.toJSON();
				contactReference.id = insertedParty1.id;
				contactReference.typeName = insertedParty1.typeName;
				var account = SampleData.createEmptyUserAccount1();
				account.contact = contactReference;

				userService.insert(account)
					.then(function (result) {
						expect(result.id).not.to.be.undefined;
						expect(result.username).eq(account.username);
						expect(result.dateCreated).not.to.be.undefined;
						expect(result.password).eq(account.password);
						expect(result.enabled).eq(account.enabled);
						expect(result.locked).eq(account.locked);
						expect(result.expire).eq(account.expire);
						expect(result.expirePassword).eq(account.expirePassword);
						expect(result.contact.id).eq(insertedParty1.id);
						expect(result.contact.typeName).not.to.be.undefined;
						expect(result.contact.displayName).not.to.be.undefined;
						expect(result.contact.emails[0].address).eq(contactReference.emails[0].address);
						temporalAccount = result;

						//Let's check if the party has the associated account.
						return partyDao.findOne(result.contact.id);
					})
					.then(function (resultQueryPart) {
						expect(resultQueryPart.id).eq(insertedParty1.id);
						expect(resultQueryPart.emailAddresses(false).length).eq(1);
						expect(resultQueryPart.emailAddresses(false)[0].address).eq(contactReference.emails[0].address);
						expect(resultQueryPart.emailAddresses(false)[0].type).eq(contactReference.emails[0].type);
						expect(resultQueryPart.emailAddresses(false)[0].primary).eq(true);
						return accountDao.findAllMethod()
					})
					.then(function (resultQueryAccount) {
						expect(resultQueryAccount.length).eq(1);
						expect(resultQueryAccount[0].username).eq(account.username);
						expect(resultQueryAccount[0].password).eq(account.password);
						expect(resultQueryAccount[0].enabled).eq(account.enabled);
						expect(resultQueryAccount[0].locked).eq(account.locked);
						expect(resultQueryAccount[0].expire).eq(account.expire);
						expect(resultQueryAccount[0].expirePassword).eq(account.expirePassword);
						expect(resultQueryAccount[0].contactId).eq(temporalAccount.contact.id);
						done();
					})
			});
		});

		describe("When inserting an account with an contact id that is already associated with another account", function () {
			it("It should return an error", function (done) {
				var contactReference = insertedParty1.toJSON();
				contactReference.id = insertedParty1.id;
				contactReference.typeName = insertedParty1.typeName;
				var account = SampleData.createEmptyUserAccount1();
				account.contact = contactReference;
				userService.insert(account)
					.then(function (insertedRecord) {
						var contactReference2 = insertedParty1.toJSON();
						contactReference2.id = insertedParty1.id;
						contactReference2.typeName = insertedParty1.typeName;
						var account2 = SampleData.createEmptyUserAccount2();
						account2.contact = contactReference2;
						return userService.insert(account2);
					})
					.then(function (insertedRecord2) {
						expect.fail("The method should not have inserted the record");
						done();
					})
					.catch(function (err) {
						expect(err.length).eq(1);
						expect(err[0].attribute).eq(userService.ACCOUNT);
						expect(err[0].message).eq(userService.ANOTHER_ACCOUNT_USING_CONTACT);
						done();
					});

			});
		});

		describe("When inserting an account with an contact id that does't exits in the database", function () {
			it("It should return an error", function (done) {
				var account = SampleData.createEmptyUserAccount1();
				account.contact = {id: invalidId1};
				userService.insert(account)
					.then(function () {
						expect.fail("The method should not have inserted the record");
						done();
					})
					.catch(function (err) {
						expect(err.length).eq(1);
						expect(err[0].attribute).eq(userService.PARTY);
						expect(err[0].message).eq(userService.NO_CONTACT_IN_DATABASE);
						done();
					})
			});
		});

		describe("When inserting an account with a valid new contact", function () {
			it("It should not return any error", function (done) {
				var newPerson;
				var contactReference;
				var account;
				newPerson = SampleData.createPerson1();
				contactReference = newPerson.toJSON();
				contactReference.typeName = newPerson.typeName;
				account = SampleData.createEmptyUserAccount2();
				account.contact = contactReference;
				userService.insert(account)
					.then(function (result) {
						expect(result.dateCreated).not.to.be.null;
						return partyDao.findOne(result.contactId);
					})
					.then(function (resultQuery) {
						expect(resultQuery).not.to.be.null;
						expect(resultQuery.dateCreated).not.to.be.undefined;
						done();
					})
			});
		});

		describe("When inserting an account with a duplicated username", function () {
			it("The method should return an error", function (done) {
				var contactReference = insertedParty1.toJSON();
				var account;
				contactReference.id = insertedParty1.id;
				contactReference.typeName = insertedParty1.typeName;
				account = SampleData.createEmptyUserAccount1();
				account.contact = contactReference;
				userService.insert(account)
					.then(function (result) {
						var contactReference2 = insertedParty2.toJSON();
						var duplicatedUserNameAccount;
						contactReference2.id = insertedParty2.id;
						contactReference2.typeName = insertedParty2.typeName;
						duplicatedUserNameAccount = SampleData.createEmptyUserAccount2();
						duplicatedUserNameAccount.username = account.username;
						duplicatedUserNameAccount.contact = contactReference2;
						return userService.insert(duplicatedUserNameAccount)
					})
					.then(function (result2) {
						expect.fail("The method should not have inserted the record");
						done();
					})
					.catch(function (err) {
						expect(err.length).eq(1);
						expect(err[0].message).eq(AccountValidator.ANOTHER_USER);
						done();
					});
			})
		});
	})
});
