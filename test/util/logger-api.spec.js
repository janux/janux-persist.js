/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var Module = require("module");
var loggerApi = require("../../dist/utils/logger-api/logger-api");
var FakeLogger = require("../../dist/utils/logger-api/fake-logger").FakeLogger;

var LOGGER_API_PATH = require.resolve("../../dist/utils/logger-api/logger-api");

describe("Testing logger-api getLogger", function() {
	describe("When log4js is available (the normal case)", function() {
		it("returns a real log4js logger, not the FakeLogger fallback", function() {
			// No cache-busting needed here: mocha already loaded this module once, normally,
			// while collecting spec files, with log4js genuinely resolvable - that's the
			// instance under test.
			var logger = loggerApi.getLogger("logger-api.spec");
			expect(logger).not.instanceOf(FakeLogger);
			expect(logger.category).eq("jnx-persist:logger-api.spec");
			expect(typeof logger.info).eq("function");
		});
	});

	describe("When log4js cannot be resolved", function() {
		it("falls back to FakeLogger instead of throwing", function() {
			// getLogger() decides between a real log4js logger and FakeLogger once, at
			// module load time (`const log4js = checkForLog4js()`), so exercising this
			// branch means forcing one fresh, isolated reload of the module with "log4js"
			// unresolvable.
			//
			// Module._resolveFilename can't be used to force that failure: once "log4js"
			// has already been required elsewhere in the process (it has, by the time this
			// spec runs), Node's internal relativeResolveCache fast-path skips
			// resolveFilename entirely on repeat requires and goes straight to the cached
			// module. Module.prototype.require sits in front of that cache, so it's the
			// reliable interception point.
			var originalRequire = Module.prototype.require;
			Module.prototype.require = function(request) {
				if (request === "log4js") {
					throw new Error("Cannot find module 'log4js'");
				}
				return originalRequire.apply(this, arguments);
			};

			var getLogger;
			try {
				delete require.cache[LOGGER_API_PATH];
				getLogger = require(LOGGER_API_PATH).getLogger;
			} finally {
				Module.prototype.require = originalRequire;
				// Restore the module to its normal, log4js-backed state immediately -
				// nothing else in the suite depends on it, but leaving the FakeLogger
				// version cached would be a surprise for any test added later.
				delete require.cache[LOGGER_API_PATH];
				require(LOGGER_API_PATH);
			}

			var logger = getLogger("logger-api.spec");
			expect(logger).instanceOf(FakeLogger);
			expect(logger.isInfoEnabled()).eq(false);
			expect(logger.info()).eq(undefined);
		});
	});
});
