/**
 * Project janux-persistence
 *
 * JAM-19 (item 3): findOneByCode() must strip sensitive account fields
 * (password) before returning, same as every other account-returning path.
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var moment = require("moment");
var DaoUtil = require("../../daos/dao-util");
var UserService = require("../../../dist/index").UserService;
var UserActionService = require("../../../dist/index").UserActionService;
var PartyService = require("../../../dist/index").PartyServiceImpl;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var PasswordService = require("../../../dist/index").PasswordService;
var serverAppContext = config.get("serverAppContext");
var EmailAddress = require("janux-people").EmailAddress;
var Person = require("janux-people").Person;
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

describe("Testing UserActionService findOneByCode method (JAM-19)", function() {
	describe("Given an account action pointing to an account with a password", function() {
		var accountActionDao;
		var accountDao;
		var partyDao;
		var staffDao;
		var userService;
		var partyService;
		var passwordService;
		var userActionService;
		var insertedAccount;
		var insertedAction;

		beforeEach(function(done) {
			accountActionDao = DaoUtil.createAccountInvDao(dbEngine, dbPath);
			accountDao = DaoUtil.createAccountDao(dbEngine, dbPath);
			partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
			staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
			partyService = new PartyService(partyDao, staffDao);
			passwordService = new PasswordService();
			userService = UserService.createInstance(accountDao, partyService, passwordService);
			// createInstance memoizes on a private static; clear it so this
			// spec doesn't inherit an instance (with a different eventBus)
			// left behind by another user-action-service spec file.
			UserActionService._instance = undefined;
			userActionService = UserActionService.createInstance(accountActionDao, userService, partyService, null);

			accountActionDao
				.removeAll()
				.then(function() {
					return accountDao.removeAll();
				})
				.then(function() {
					return partyDao.removeAll();
				})
				.then(function() {
					return staffDao.removeAll();
				})
				.then(function() {
					var person = new Person();
					person.name.first = "Jane";
					person.name.last = "Doe";
					person.setContactMethod("work", new EmailAddress("jane.doe@example.com"));
					var contactReference = person.toJSON();
					contactReference.typeName = person.typeName;
					return userService.insert({
						username: "jam19-findbycode",
						password: "shouldNeverLeaveTheServer",
						enabled: true,
						locked: false,
						contact: contactReference,
						roles: ["user"]
					});
				})
				.then(function(account) {
					insertedAccount = account;
					return userActionService.insert({
						accountId: insertedAccount.userId,
						code: "FIND-ME",
						type: "recoverPassword",
						status: "pending",
						expire: moment().add(5, "days").toDate()
					});
				})
				.then(function(action) {
					insertedAction = action;
					done();
				});
		});

		it("does not include the account's password hash in the response", function(done) {
			userActionService
				.findOneByCode("FIND-ME")
				.then(function(result) {
					expect(result.account).to.exist;
					expect(result.account.password).to.be.undefined;
					done();
				})
				.catch(done);
		});
	});
});
