/**
 * Project janux-persistence
 *
 * JAM-19: UserActionService.update() must validate the stored invitation
 * record (code/status/expire) and the account being written, rather than
 * trusting those fields from the caller's object.
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

const personName = "John";
const personLastName = "Doe";
const contactEmail = "john.doe@example.com";
const contactType = "work";

const accountUsername = "jam19-account";
const accountPassword = "originalPassword";
const attackerPassword = "attackerControlledPassword";

const validCode = "VALID-CODE-1";

describe("Testing UserActionService update method (JAM-19)", function() {
	describe("Given a pending, unexpired account action tied to an account", function() {
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
		var otherAccount;

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
					person.name.first = personName;
					person.name.last = personLastName;
					person.setContactMethod(contactType, new EmailAddress(contactEmail));
					var contactReference = person.toJSON();
					contactReference.typeName = person.typeName;
					return userService.insert({
						username: accountUsername,
						password: accountPassword,
						enabled: true,
						locked: false,
						contact: contactReference,
						roles: ["user"]
					});
				})
				.then(function(account) {
					insertedAccount = account;
					// A second, unrelated account - the attacker's own - used to
					// prove an invitation for one account can't be redeemed
					// against another.
					var otherPerson = new Person();
					otherPerson.name.first = "Jane";
					otherPerson.name.last = "Attacker";
					otherPerson.setContactMethod(contactType, new EmailAddress("attacker@example.com"));
					var otherContactReference = otherPerson.toJSON();
					otherContactReference.typeName = otherPerson.typeName;
					return userService.insert({
						username: "jam19-attacker",
						password: "whatever",
						enabled: true,
						locked: false,
						contact: otherContactReference,
						roles: ["user"]
					});
				})
				.then(function(account) {
					otherAccount = account;
					return userActionService.insert({
						accountId: insertedAccount.userId,
						code: validCode,
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

		it("rejects a wrong code even when the account payload is otherwise valid", function(done) {
			userActionService
				.update(
					{
						id: insertedAction.id,
						code: "not-the-right-code",
						account: Object.assign({}, insertedAccount, { password: attackerPassword })
					},
					false
				)
				.then(function() {
					done(new Error("Expected the update to be rejected"));
				})
				.catch(function(errors) {
					expect(errors[0].message).to.equal(userActionService.ACCOUNT_INV_CODE_MISMATCH);
					done();
				});
		});

		it("rejects a correct code applied to a different account than the invitation was issued for", function(done) {
			userActionService
				.update(
					{
						id: insertedAction.id,
						code: validCode,
						account: Object.assign({}, otherAccount, { password: attackerPassword })
					},
					false
				)
				.then(function() {
					done(new Error("Expected the update to be rejected"));
				})
				.catch(function(errors) {
					expect(errors[0].message).to.equal(userActionService.ACCOUNT_INV_ACCOUNT_MISMATCH);
					done();
				});
		});

		it("rejects an expired invitation even with the correct code and account", function(done) {
			var expiredAction;
			accountActionDao
				.findOne(insertedAction.id)
				.then(function(action) {
					action.expire = moment().subtract(1, "days").toDate();
					return accountActionDao.update(action);
				})
				.then(function(action) {
					expiredAction = action;
					return userActionService.update(
						{
							id: expiredAction.id,
							code: validCode,
							account: Object.assign({}, insertedAccount, { password: "newPassword" })
						},
						false
					);
				})
				.then(function() {
					done(new Error("Expected the update to be rejected"));
				})
				.catch(function(errors) {
					expect(errors[0].message).to.equal(userActionService.ACCOUNT_INV_EXPIRED);
					done();
				});
		});

		it("rejects an already-completed invitation (no replay)", function(done) {
			var newPassword = "firstCompletionPassword";
			userActionService
				.update(
					{
						id: insertedAction.id,
						code: validCode,
						account: Object.assign({}, insertedAccount, { password: newPassword })
					},
					false
				)
				.then(function() {
					// Replay the exact same, now-stale request.
					return userActionService.update(
						{
							id: insertedAction.id,
							code: validCode,
							account: Object.assign({}, insertedAccount, { password: attackerPassword })
						},
						false
					);
				})
				.then(function() {
					done(new Error("Expected the replay to be rejected"));
				})
				.catch(function(errors) {
					expect(errors[0].message).to.equal(userActionService.ACCOUNT_INV_ALREADY_COMPLETED);
					done();
				});
		});

		it("accepts a valid completion: correct code, matching account, pending and unexpired", function(done) {
			var newPassword = "legitimateNewPassword";
			userActionService
				.update(
					{
						id: insertedAction.id,
						code: validCode,
						account: Object.assign({}, insertedAccount, { password: newPassword })
					},
					false
				)
				.then(function(result) {
					expect(result.status).to.equal("completed");
					expect(result.account.id).to.equal(insertedAccount.id);
					return accountActionDao.findOne(insertedAction.id);
				})
				.then(function(persistedAction) {
					expect(persistedAction.status).to.equal("completed");
					done();
				})
				.catch(done);
		});

		it("skipAccountUpdate=true (trusted, service-internal refresh) is unaffected by the new validation", function(done) {
			var refreshed = Object.assign({}, insertedAction, {
				code: "SERVER-REISSUED-CODE",
				expire: moment().add(5, "days").toDate()
			});
			userActionService
				.update(refreshed, true)
				.then(function(result) {
					expect(result.code).to.equal("SERVER-REISSUED-CODE");
					done();
				})
				.catch(done);
		});
	});
});
