/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var FakeLogger = require("../../dist/utils/logger-api/fake-logger").FakeLogger;

describe("Testing FakeLogger", function() {
	var logger;

	beforeEach(function() {
		logger = new FakeLogger();
	});

	["trace", "debug", "info", "warn", "error", "fatal", "mark"].forEach(function(level) {
		describe("When calling " + level + "()", function() {
			it("is a no-op that returns undefined", function() {
				expect(logger[level]()).eq(undefined);
			});
		});

		describe("When calling is" + level.charAt(0).toUpperCase() + level.slice(1) + "Enabled()", function() {
			it("returns false", function() {
				var methodName = "is" + level.charAt(0).toUpperCase() + level.slice(1) + "Enabled";
				expect(logger[methodName]()).eq(false);
			});
		});
	});

	describe("When calling log()", function() {
		it("is a no-op that returns undefined", function() {
			expect(logger.log()).eq(undefined);
		});
	});

	describe("When calling isLevelEnabled()", function() {
		it("returns false", function() {
			expect(logger.isLevelEnabled()).eq(false);
		});
	});

	describe("When calling addContext(), removeContext() and clearContext()", function() {
		it("are all no-ops that return undefined", function() {
			expect(logger.addContext()).eq(undefined);
			expect(logger.removeContext()).eq(undefined);
			expect(logger.clearContext()).eq(undefined);
		});
	});
});
