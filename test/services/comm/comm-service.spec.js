var chai = require("chai");
var expect = chai.expect;
var config = require("config");

var CommService = require("../../../dist/index").CommService;

//
// Guards the one log line that makes outbound mail observable.
//
// CommService hands every message to mail-time, which owns the retry loop and
// decides whether the caller's callback ever runs. It frequently doesn't: the
// give-up branch is unreachable (the worker claims tasks with
// `tries < maxTries`, the give-up guard needs `tries > maxTries`), the callback
// registry is in-memory and lost on restart, and `concatEmails` drops the
// callback for merged messages. So the success/failure logging inside those
// callbacks cannot be what tells you whether mail is flowing.
//
// The attempt log is emitted synchronously by sendEmail itself, before the
// queue is involved at all, which is exactly why it survives all three of
// those cases. These tests assert it stays that way — the failure mode being
// guarded against is a silent outage, which is what happened for 14 months
// when the only logging lived in an unreachable callback.
//
describe("Testing comm service", function() {
	var commDataSource = {
		dbEngine: config.serverAppContext.db.dbEngine,
		dbPath: config.serverAppContext.db.mongoConnUrl
	};

	// Port 1 is closed, so nothing here can accidentally send real mail.
	var deadSmtp = {
		host: "127.0.0.1",
		port: 1,
		from: "test@example.com",
		auth: { user: "user", pass: "pass" }
	};

	var service;
	var logged;

	beforeEach(function() {
		// createInstance memoizes on a private static; clear it so each test
		// builds its own service rather than reusing one from another spec.
		CommService._instance = undefined;
		service = CommService.createInstance(commDataSource, deadSmtp);

		logged = [];
		service._log = {
			debug: function() {},
			info: function() {
				logged.push({ level: "info", args: Array.prototype.slice.call(arguments) });
			},
			error: function() {
				logged.push({ level: "error", args: Array.prototype.slice.call(arguments) });
			}
		};
	});

	describe("When constructing the queue", function() {
		it("Should keep email concatenation off", function() {
			// Concatenation batches messages sharing a recipient. Turning it on
			// reintroduces three regressions at once: a ~60s delay on every
			// send (concatThrottling's default window), a dropped callback for
			// any merged message, and a subject replaced by the
			// "Multiple notifications" fallback. None are acceptable for
			// transactional mail, and none surface in an obvious way — hence
			// asserting on the constructed queue rather than trusting review.
			expect(service.mailQueue.concatEmails).to.eq(false);
		});

		it("Should not defer the first send attempt", function() {
			// concatThrottling is only applied on the concatenation branch, so
			// with concatEmails off a message is queued with the caller's own
			// sendAt and becomes eligible immediately.
			expect(service.mailQueue.concatEmails).to.eq(false);
			expect(service.mailQueue.maxTries).to.be.above(0);
		});
	});

	describe("When calling sendEmail", function() {
		it("Should log the attempt at INFO before handing off to the queue", function() {
			service.sendEmail({
				to: "recipient@example.com",
				subject: "a subject",
				text: "body",
				html: "<p>body</p>"
			});

			// Synchronous: no waiting on the queue, which is the whole point.
			var attempts = logged.filter(function(entry) {
				return entry.level === "info" && /Attempting to send email/.test(entry.args[0]);
			});

			expect(attempts.length).to.eq(1);
		});

		it("Should include the recipient and subject in the attempt log", function() {
			service.sendEmail({
				to: "recipient@example.com",
				subject: "a subject",
				text: "body",
				html: "<p>body</p>"
			});

			var attempt = logged.filter(function(entry) {
				return entry.level === "info" && /Attempting to send email/.test(entry.args[0]);
			})[0];

			// Both must be present and passed as separate format arguments —
			// interpolating them into the message string would defeat log4js's
			// own formatting and is how the original error logging became
			// useless (`%j` on an object whose fields are non-enumerable).
			expect(attempt.args).to.include("recipient@example.com");
			expect(attempt.args).to.include("a subject");
		});

		it("Should log the attempt even when the SMTP host is unreachable", function() {
			// The transport is pointed at a closed port, so this send can never
			// succeed. The attempt must still be recorded — a broken provider is
			// precisely when the log matters.
			service.sendEmail({
				to: "unreachable@example.com",
				subject: "will not send",
				text: "body",
				html: "<p>body</p>"
			});

			var attempts = logged.filter(function(entry) {
				return entry.level === "info" && /Attempting to send email/.test(entry.args[0]);
			});

			expect(attempts.length).to.eq(1);
			expect(attempts[0].args).to.include("unreachable@example.com");
		});
	});
});
