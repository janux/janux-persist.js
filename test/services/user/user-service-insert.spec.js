/**
 * Project janux-persistence
 * Created by ernesto on 6/29/17.
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var UserService = require("../../../dist/index").UserService;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var AccountValidator = require("../../../dist/index").AccountValidator;
var PartyService = require("../../../dist/index").PartyServiceImpl;
var GroupService = require("../../../dist/index").GroupServiceImpl;
var PartyGroupService = require("../../../dist/index").PartyGroupServiceImpl;
var PasswordService = require("../../../dist/index").PasswordService;
var SampleData = require("../../util/sample-data");
var DaoUtil = require("../../daos/dao-util");
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

var invalidId1 = "313030303030303030303030";

describe("Testing user service service insertMethod method", function() {
	describe("Given the inserted contacts", function() {
		var insertedParty1;
		var insertedParty2;
		var partyDao;
		var accountDao;
		var userService;
		var partyService;
		var staffDao;
		var groupDao;
		var groupContentDao;
		var groupAttributeValueDao;
		var groupService;
		var partyGroupService;
		var passwordService = new PasswordService();

		beforeEach(function(done) {
			partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
			accountDao = DaoUtil.createAccountDao(dbEngine, dbPath);
			staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
			groupDao = DaoUtil.createGroupDao(dbEngine, dbPath);
			groupContentDao = DaoUtil.createGroupContentDao(dbEngine, dbPath);
			groupAttributeValueDao = DaoUtil.createGroupAttributesDao(dbEngine, dbPath);
			partyService = new PartyService(partyDao, staffDao);
			groupService = new GroupService(groupDao, groupContentDao, groupAttributeValueDao);
			partyGroupService = new PartyGroupService(partyService, groupService);
			userService = UserService.createInstance(accountDao, partyService, passwordService);
			setTimeout(function() {
				accountDao
					.removeAll()
					.then(function() {
						return partyDao.removeAll();
					})
					.then(function() {
						return staffDao.removeAll();
					})
					.then(function() {
						// Inserting one person
						var person = SampleData.createPerson1();
						return partyDao.insert(person);
					})
					.then(function(insertedPerson) {
						insertedParty1 = insertedPerson;
						//Inserting organization
						var organization = SampleData.createOrganization1();
						return partyDao.insert(organization);
					})
					.then(function(insertedOrganization) {
						insertedParty2 = insertedOrganization;
						done();
					});
			}, 10);
		});

		describe("When inserting an correct account with an contact id", function() {
			it("It should not return any error", function(done) {
				var temporalAccount;
				var contactReference = insertedParty1.toJSON();
				contactReference.id = insertedParty1.id;
				contactReference.typeName = insertedParty1.typeName;
				var account = SampleData.createEmptyUserAccount1();
				account.contact = contactReference;

				userService
					.insert(account)
					.then(function(result) {
						expect(result.id).not.to.be.undefined;
						expect(result.username).eq(account.username);
						expect(result.dateCreated).not.to.be.undefined;
						// expect(result.password).eq(account.password);
						expect(passwordService.isValidPassword(result.password, account.password)).eq(true);
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
					.then(function(resultQueryPart) {
						expect(resultQueryPart.id).eq(insertedParty1.id);
						expect(resultQueryPart.emailAddresses(false).length).eq(1);
						expect(resultQueryPart.emailAddresses(false)[0].address).eq(contactReference.emails[0].address);
						expect(resultQueryPart.emailAddresses(false)[0].type).eq(contactReference.emails[0].type);
						expect(resultQueryPart.emailAddresses(false)[0].primary).eq(true);
						return accountDao.findAllMethod();
					})
					.then(function(resultQueryAccount) {
						expect(resultQueryAccount.length).eq(1);
						expect(resultQueryAccount[0].username).eq(account.username);
						// expect(resultQueryAccount[0].password).eq(account.password);
						expect(passwordService.isValidPassword(resultQueryAccount[0].password, account.password)).eq(
							true
						);
						expect(resultQueryAccount[0].enabled).eq(account.enabled);
						expect(resultQueryAccount[0].locked).eq(account.locked);
						expect(resultQueryAccount[0].expire).eq(account.expire);
						expect(resultQueryAccount[0].expirePassword).eq(account.expirePassword);
						expect(resultQueryAccount[0].contactId).eq(temporalAccount.contact.id);
						done();
					});
			});
		});

		describe("When inserting an account with an contact id that is already associated with another account", function() {
			it("It should return an error", function(done) {
				var contactReference = insertedParty1.toJSON();
				contactReference.id = insertedParty1.id;
				contactReference.typeName = insertedParty1.typeName;
				var account = SampleData.createEmptyUserAccount1();
				account.contact = contactReference;
				userService
					.insert(account)
					.then(function(insertedRecord) {
						var contactReference2 = insertedParty1.toJSON();
						contactReference2.id = insertedParty1.id;
						contactReference2.typeName = insertedParty1.typeName;
						var account2 = SampleData.createEmptyUserAccount2();
						account2.contact = contactReference2;
						return userService.insert(account2);
					})
					.then(function(insertedRecord2) {
						expect.fail("The method should not have inserted the record");
						done();
					})
					.catch(function(err) {
						expect(err.length).eq(1);
						expect(err[0].attribute).eq(userService.ACCOUNT);
						expect(err[0].message).eq(userService.ANOTHER_ACCOUNT_USING_CONTACT);
						done();
					});
			});
		});

		describe("When inserting an account with an contact id that does't exits in the database", function() {
			it("It should return an error", function(done) {
				var account = SampleData.createEmptyUserAccount1();
				account.contact = {id: invalidId1};
				userService
					.insert(account)
					.then(function() {
						expect.fail("The method should not have inserted the record");
						done();
					})
					.catch(function(err) {
						expect(err.length).eq(1);
						expect(err[0].attribute).eq(userService.PARTY);
						expect(err[0].message).eq(userService.NO_CONTACT_IN_DATABASE);
						done();
					});
			});
		});

		describe("When inserting an account with a valid new contact", function() {
			it("It should not return any error", function(done) {
				var newPerson;
				var contactReference;
				var account;
				newPerson = SampleData.createPerson2();
				contactReference = newPerson.toJSON();
				contactReference.typeName = newPerson.typeName;
				account = SampleData.createEmptyUserAccount2();
				account.contact = contactReference;
				userService
					.insert(account)
					.then(function(result) {
						expect(result.dateCreated).not.to.be.null;
						return partyDao.findOne(result.contactId);
					})
					.then(function(resultQuery) {
						expect(resultQuery).not.to.be.null;
						expect(resultQuery.dateCreated).not.to.be.undefined;
						done();
					});
			});
		});

		describe("When inserting an account with a new contact that has a duplicated email address", function() {
			it("The method should return an error", function(done) {
				var newPerson;
				var contactReference;
				var account;
				var initialPartyCount = 0;
				var initialAccountCount = 0;
				newPerson = SampleData.createPerson2();

				accountDao.count()
					.then(function(result) {
						initialAccountCount = result;
						return partyDao.count();
					})
					.then(function(result) {
						initialPartyCount = result;
						return partyService.insert(newPerson);
					})
					.then(function(result) {
						var newPersonSameEmailAddress = SampleData.createPerson2();
						contactReference = newPersonSameEmailAddress.toJSON();
						contactReference.typeName = newPersonSameEmailAddress.typeName;
						account = SampleData.createEmptyUserAccount2();
						account.username = "anotherAndDifferentUserName";
						account.contact = contactReference;
						return userService.insert(account)
					})
					.then(function(result) {
						expect.fail("The method should not have inserted any record");
						done();
					}, function(error) {
						partyDao.count()
							.then(function(partyCount) {
								expect(partyCount).eq(initialPartyCount + 1);
								return accountDao.count();
							})
							.then(function(accountCount) {
								expect(accountCount).eq(initialAccountCount);
								done();
							});
					});
			});
		});

		describe("When inserting an account with a duplicated username", function() {
			it("The method should return an error", function(done) {
				var contactReference = insertedParty1.toJSON();
				var account;
				contactReference.id = insertedParty1.id;
				contactReference.typeName = insertedParty1.typeName;
				account = SampleData.createEmptyUserAccount1();
				account.contact = contactReference;

				var initialPartyCount = 0;
				var initialAccountCount = 0;

				// accountDao.count()
				// 	.then(function(result) {
				// 		initialAccountCount = result;
				// 		return partyDao.count();
				// 	})
				// 	.then(function(result) {
				// 		initialPartyCount = result;
				// 		return userService.insert(account);
				// 	});

				userService.insert(account).then(function(result) {
					return  accountDao.count()
				}).then(function(result) {
					initialAccountCount = result;
					return partyDao.count();
				}).then(function(result) {
					initialPartyCount = result;
					var contactReference2 = insertedParty2.toJSON();
					var duplicatedUserNameAccount;
					contactReference2.id = insertedParty2.id;
					contactReference2.typeName = insertedParty2.typeName;
					duplicatedUserNameAccount = SampleData.createEmptyUserAccount2();
					duplicatedUserNameAccount.username = account.username;
					duplicatedUserNameAccount.contact = contactReference2;
					return userService.insert(duplicatedUserNameAccount);
				}).then(function(result2) {
					expect.fail("The method should not have inserted the record");
					done();
				}).catch(function(err) {
					expect(err.length).eq(1);
					expect(err[0].message).eq(AccountValidator.ANOTHER_USER);
					partyDao.count()
						.then(function(partyCount) {
							expect(partyCount).eq(initialPartyCount);
							return accountDao.count();
						})
						.then(function(accountCount) {
							expect(accountCount).eq(initialAccountCount);
							done();
						});
				});
			});
		});
	});
});
