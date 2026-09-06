/**
 * Project janux-persistence
 *
 * JAM-19 (item 1): recoverPassword() must not mail the reset code to an
 * address the caller merely supplies - only to an address actually
 * registered against the account's own contact record.
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var path = require("path");
var DaoUtil = require("../../daos/dao-util");
var UserService = require("../../../dist/index").UserService;
var UserActionServiceProd = require("../../../dist/index").UserActionServiceProd;
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
const templateUrl = path.join(__dirname, "..", "..", "fixtures", "recover-password-template.pug");

function createFakeCommService() {
	return {
		events: {
			EMAIL_SUCCESS_SENT_EVENT: "emailSuccessSent",
			EMAIL_SENT_ERROR_EVENT: "emailSentError"
		},
		sentEmails: [],
		on: function() {
			// No-op: tests assert on sentEmails directly rather than events.
		},
		sendEmail: function(emailParams) {
			this.sentEmails.push(emailParams);
		}
	};
}

describe("Testing UserActionServiceProd recoverPassword method (JAM-19)", function() {
	describe("Given an account whose contact has one registered email address", function() {
		var accountActionDao;
		var accountDao;
		var partyDao;
		var staffDao;
		var userService;
		var partyService;
		var passwordService;
		var commService;
		var userActionService;
		var insertedAccount;

		// UserActionServiceProd is a singleton (createInstance caches the
		// first-created instance, ignoring later args) - so the commService
		// it holds must be wired up exactly once here, not recreated in
		// beforeEach, or later tests would assert on a mock object the
		// service was never actually given.
		before(function() {
			accountActionDao = DaoUtil.createAccountInvDao(dbEngine, dbPath);
			accountDao = DaoUtil.createAccountDao(dbEngine, dbPath);
			partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
			staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
			partyService = new PartyService(partyDao, staffDao);
			passwordService = new PasswordService();
			commService = createFakeCommService();
			userService = UserService.createInstance(accountDao, partyService, passwordService);
			userActionService = UserActionServiceProd.createInstance(
				accountActionDao,
				userService,
				partyService,
				commService
			);
		});

		beforeEach(function(done) {
			commService.sentEmails = [];

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

		// recoverPassword is `protected` in TypeScript, but that's not enforced
		// at runtime in the compiled JS - called directly here the same way
		// UserActionServiceProd's own methods call it internally.
		it("rejects a caller-supplied address that does not belong to the account and sends no email", function(done) {
			userActionService
				.recoverPassword(insertedAccount.userId, insertedAccount.contact.id, {
					selectedEmail: attackerEmail,
					hostname: "example.com",
					msgSubject: "Password recovery",
					templateUrl: templateUrl
				})
				.then(function() {
					done(new Error("Expected recoverPassword to reject an unregistered address"));
				})
				.catch(function() {
					expect(commService.sentEmails).to.have.lengthOf(0);
					done();
				});
		});

		it("accepts and mails an address that is actually registered to the account's contact", function(done) {
			userActionService
				.recoverPassword(insertedAccount.userId, insertedAccount.contact.id, {
					selectedEmail: registeredEmail,
					hostname: "example.com",
					msgSubject: "Password recovery",
					templateUrl: templateUrl
				})
				.then(function() {
					expect(commService.sentEmails).to.have.lengthOf(1);
					expect(commService.sentEmails[0].to).to.equal(registeredEmail);
					done();
				})
				.catch(done);
		});
	});
});
