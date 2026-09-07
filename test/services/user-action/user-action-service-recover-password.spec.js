/**
 * Project janux-persistence
 *
 * JAM-19 (item 1): recoverPassword() must not mail the reset code to an
 * address the caller merely supplies - only to an address actually
 * registered against the account's own contact record.
 *
 * Also covers the janux-mail plan's Step 1c collapse: recoverPassword no
 * longer renders a template or calls a commService directly - it emits
 * MAIL_EVENT_NAMES.PASSWORD_RECOVERY_REQUESTED through an injected event
 * bus, and the calling app's own wiring module is what renders/sends.
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var DaoUtil = require("../../daos/dao-util");
var UserService = require("../../../dist/index").UserService;
var UserActionService = require("../../../dist/index").UserActionService;
var MAIL_EVENT_NAMES = require("../../../dist/index").MAIL_EVENT_NAMES;
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

const registeredEmail = "owner@example.com";
const attackerEmail = "attacker@evil.example.com";

function createFakeEventBus() {
	return {
		emittedEvents: [],
		emit: function(eventName, payload) {
			this.emittedEvents.push({ eventName: eventName, payload: payload });
		}
	};
}

describe("Testing UserActionService recoverPassword method (JAM-19)", function() {
	describe("Given an account whose contact has one registered email address", function() {
		var accountActionDao;
		var accountDao;
		var partyDao;
		var staffDao;
		var userService;
		var partyService;
		var passwordService;
		var eventBus;
		var userActionService;
		var insertedAccount;

		// UserActionService is a singleton (createInstance caches the
		// first-created instance, ignoring later args) - so the eventBus it
		// holds must be wired up exactly once here, not recreated in
		// beforeEach, or later tests would assert on a mock object the
		// service was never actually given.
		before(function() {
			accountActionDao = DaoUtil.createAccountInvDao(dbEngine, dbPath);
			accountDao = DaoUtil.createAccountDao(dbEngine, dbPath);
			partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
			staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
			partyService = new PartyService(partyDao, staffDao);
			passwordService = new PasswordService();
			eventBus = createFakeEventBus();
			userService = UserService.createInstance(accountDao, partyService, passwordService);
			// createInstance memoizes on a private static; clear it so this
			// spec's fake eventBus wins instead of a null one left behind by
			// another user-action-service spec file sharing the same process.
			UserActionService._instance = undefined;
			userActionService = UserActionService.createInstance(
				accountActionDao,
				userService,
				partyService,
				eventBus
			);
		});

		beforeEach(function(done) {
			eventBus.emittedEvents = [];

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
					person.name.first = "Owner";
					person.name.last = "Doe";
					person.setContactMethod("work", new EmailAddress(registeredEmail));
					var contactReference = person.toJSON();
					contactReference.typeName = person.typeName;
					return userService.insert({
						username: "jam19-recover",
						password: "originalPassword",
						enabled: true,
						locked: false,
						contact: contactReference,
						roles: ["user"]
					});
				})
				.then(function(account) {
					insertedAccount = account;
					done();
				});
		});

		it("rejects a caller-supplied address that does not belong to the account and emits nothing", function(done) {
			userActionService
				.recoverPassword(insertedAccount.userId, insertedAccount.contact.id, {
					selectedEmail: attackerEmail,
					hostname: "example.com"
				})
				.then(function() {
					done(new Error("Expected recoverPassword to reject an unregistered address"));
				})
				.catch(function() {
					expect(eventBus.emittedEvents).to.have.lengthOf(0);
					done();
				});
		});

		it("accepts a registered address and emits password.recoveryRequested with the recovery data", function(done) {
			userActionService
				.recoverPassword(insertedAccount.userId, insertedAccount.contact.id, {
					selectedEmail: registeredEmail,
					hostname: "example.com"
				})
				.then(function() {
					expect(eventBus.emittedEvents).to.have.lengthOf(1);
					var emitted = eventBus.emittedEvents[0];
					expect(emitted.eventName).to.equal(MAIL_EVENT_NAMES.PASSWORD_RECOVERY_REQUESTED);
					expect(emitted.payload.to).to.equal(registeredEmail);
					expect(emitted.payload.data.name).to.equal("Owner Doe");
					expect(emitted.payload.data.hostname).to.equal("example.com");
					expect(emitted.payload.data.recoveryCode).to.be.a("string").and.have.lengthOf(12);
					done();
				})
				.catch(done);
		});
	});
});
