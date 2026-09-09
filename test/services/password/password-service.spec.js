var chai = require("chai");
var expect = chai.expect;

var PasswordService = require("../../../dist/index").PasswordService;
var passwordService = new PasswordService();

const password = "1234567890";
const legacyMd5Hash = "e807f1fcf82d132f9bb018ca6738a19f"; // md5("1234567890"), a pre-JAM-41 hash

describe("Testing password service", function() {
	describe("When calling hashPassword", function() {
		it("The method should return a bcrypt hash, not the legacy md5 one", function() {
			var result = passwordService.hashPassword(password);
			expect(result).to.match(/^\$2[aby]\$/);
			expect(result).to.not.eq(legacyMd5Hash);
		});
	});

	describe("When calling isValidPassword", function() {
		it("The method should accept a matching bcrypt hash", function() {
			var hash = passwordService.hashPassword(password);
			const value = passwordService.isValidPassword(hash, password);
			expect(value).eq(true);
		});

		it("The method should reject a non-matching bcrypt hash", function() {
			var hash = passwordService.hashPassword(password);
			const value = passwordService.isValidPassword(hash, "wrong-password");
			expect(value).eq(false);
		});

		it("The method should still accept a legacy md5 hash (JAM-41 migration shim)", function() {
			const value = passwordService.isValidPassword(legacyMd5Hash, password);
			expect(value).eq(true);
		});

		it("The method should reject a legacy md5 hash with the wrong password", function() {
			const value = passwordService.isValidPassword(legacyMd5Hash, "wrong-password");
			expect(value).eq(false);
		});
	});

	describe("When calling isLegacyHash", function() {
		it("The method should return true for a 32-hex-char md5-shaped hash", function() {
			expect(passwordService.isLegacyHash(legacyMd5Hash)).eq(true);
		});

		it("The method should return false for a bcrypt hash", function() {
			var hash = passwordService.hashPassword(password);
			expect(passwordService.isLegacyHash(hash)).eq(false);
		});

		it("The method should return false for an empty value", function() {
			expect(passwordService.isLegacyHash("")).eq(false);
		});
	});
});
