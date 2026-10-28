/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var moment = require("moment");
var capture = require("../../util/log-capture");
var DaoUtil = require("../../daos/dao-util");
var UserService = require("../../../dist/index").UserService;
var UserActionService = require("../../../dist/index").UserActionService;
var CommService = require("../../../dist/index").CommService;
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

//
// JAM-80: a secret that is freshly generated or freshly supplied must never reach a log line, at any
// level. The secrets here are the three kinds the services handle: a plaintext password, the stored
// password hash, and the single-use code of an invitation or password recovery (a bearer token for
// taking over an account). Every flow that touches them runs with all logging captured, below the
// level check so DEBUG and TRACE count, and the whole capture is searched for each secret value.
//
describe("Testing that no log statement prints a password, a password hash or an invitation code (JAM-80)", function() {
	var PASSWORD_INSERT = "insertedPassw0rd!Alpha";
	var PASSWORD_UPDATE = "updatedPassw0rd!Bravo";
	var PASSWORD_COMPLETE = "completedPassw0rd!Charlie";
	var CODE_SUPPLIED = "SuppliedCode0123";

	var accountActionDao;
	var accountDao;
	var partyDao;
	var staffDao;
	var userService;
	var partyService;
	var userActionService;
	var eventBus;
	var insertedAccount;
	var contactId;
	var secrets;

	function createFakeEventBus() {
		return {
			emittedEvents: [],
			emit: function(eventName, payload) {
				this.emittedEvents.push({ eventName: eventName, payload: payload });
			}
		};
	}

	// Everything stored that must stay secret by now: password hashes and codes, read back raw
	function collectStoredSecrets() {
		return Promise.all([accountDao.findAll(), accountActionDao.findAll()]).then(function(results) {
			results[0].forEach(function(account) {
				secrets.push(account.password);
			});
			results[1].forEach(function(action) {
				secrets.push(action.code);
			});
		});
	}

	function expectNoSecretsLogged() {
		return collectStoredSecrets().then(function() {
			var leaks = capture.leaks(secrets);
			expect(leaks, "log lines carrying a secret: " + JSON.stringify(leaks)).to.be.empty;
		});
	}

	before(function() {
		capture.install();
		accountActionDao = DaoUtil.createAccountInvDao(dbEngine, dbPath);
		accountDao = DaoUtil.createAccountDao(dbEngine, dbPath);
		partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
		staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
		partyService = new PartyService(partyDao, staffDao);
		eventBus = createFakeEventBus();
		userService = UserService.createInstance(accountDao, partyService, new PasswordService());
		UserActionService._instance = undefined;
		userActionService = UserActionService.createInstance(accountActionDao, userService, partyService, eventBus);
	});

	after(function() {
		capture.uninstall();
	});

	beforeEach(function() {
		capture.reset();
		eventBus.emittedEvents = [];
		secrets = [PASSWORD_INSERT, PASSWORD_UPDATE, PASSWORD_COMPLETE, CODE_SUPPLIED];

		return accountActionDao
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
				person.name.first = "Audit";
				person.name.last = "Subject";
				person.setContactMethod("work", new EmailAddress("audit.subject@example.com"));
				var contactReference = person.toJSON();
				contactReference.typeName = person.typeName;
				return userService.insert({
					username: "jam80-audit",
					password: PASSWORD_INSERT,
					enabled: true,
					locked: false,
					contact: contactReference,
					roles: ["user"]
				});
			})
			.then(function(account) {
				insertedAccount = account;
				contactId = account.contact.id;
			});
	});

	it("inserting a user", function() {
		return expectNoSecretsLogged();
	});

	it("updating a user's password, and finding the user afterwards", function() {
		return userService
			.update(Object.assign({}, insertedAccount, { password: PASSWORD_UPDATE }))
			.then(function() {
				return userService.findOneByUserName("jam80-audit");
			})
			.then(function() {
				return userService.findOneByUserId(insertedAccount.userId);
			})
			.then(expectNoSecretsLogged);
	});

	it("hashing and checking a password", function() {
		var passwordService = new PasswordService();
		var hash = passwordService.hashPassword(PASSWORD_UPDATE);
		secrets.push(hash);
		expect(passwordService.isValidPassword(hash, PASSWORD_UPDATE)).eq(true);
		expect(passwordService.isValidPassword(hash, "not the password")).eq(false);
		return expectNoSecretsLogged();
	});

	it("storing and finding an invitation by its code, and completing it with a new password", function() {
		return userActionService
			.insert({
				accountId: insertedAccount.userId,
				code: CODE_SUPPLIED,
				type: "recoverPassword",
				status: "pending",
				expire: moment().add(5, "days").toDate()
			})
			.then(function(action) {
				return userActionService.findOneByCode(CODE_SUPPLIED).then(function() {
					return userActionService.update(
						{
							id: action.id,
							code: CODE_SUPPLIED,
							account: Object.assign({}, insertedAccount, { password: PASSWORD_COMPLETE })
						},
						false
					);
				});
			})
			.then(expectNoSecretsLogged);
	});

	it("asking for a password recovery, which generates a code", function() {
		return userActionService
			.recoverPassword(insertedAccount.userId, contactId, {
				selectedEmail: "audit.subject@example.com",
				hostname: "example.com"
			})
			.then(function() {
				expect(eventBus.emittedEvents).to.have.lengthOf(1);
				secrets.push(eventBus.emittedEvents[0].payload.data.recoveryCode);
				return expectNoSecretsLogged();
			});
	});

	it("inviting a contact to create an account, which generates a code", function() {
		return userActionService
			.inviteToCreateAccount(contactId, ["user"], {
				selectedEmail: "audit.subject@example.com",
				hostname: "example.com"
			})
			.then(function() {
				eventBus.emittedEvents.forEach(function(emitted) {
					var data = emitted.payload && emitted.payload.data;
					secrets.push(data && (data.invitationCode || data.code));
				});
				return expectNoSecretsLogged();
			});
	});

	it("sending the email that carries a recovery code in its link", function() {
		// CommService's mail queue lives in MongoDB, so it only exists for that engine
		if (dbEngine !== DataSourceHandler.MONGOOSE) {
			return this.skip();
		}
		var emailedCode = "EmailedCode4567";
		secrets.push(emailedCode);
		// A closed port: nothing is delivered, the point is what is logged on the way
		var deadSmtp = { host: "127.0.0.1", port: 1, from: "test@example.com", auth: { user: "user", pass: "pass" } };
		CommService._instance = undefined;
		var commService = CommService.createInstance({ dbEngine: dbEngine, dbPath: dbPath }, deadSmtp);
		try {
			commService.sendEmail({
				to: "audit.subject@example.com",
				subject: "Reset your password",
				text: "Use https://example.com/recover/" + emailedCode,
				html: '<a href="https://example.com/recover/' + emailedCode + '">Reset your password</a>'
			});
		} finally {
			CommService._instance = undefined;
		}
		return expectNoSecretsLogged();
	});
});
