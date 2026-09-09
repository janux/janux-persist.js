var chai = require("chai");
var expect = chai.expect;

var passwordPolicy = require("../../../dist/index");
var DEFAULT_PASSWORD_POLICY = passwordPolicy.DEFAULT_PASSWORD_POLICY;
var isPasswordValid = passwordPolicy.isPasswordValid;

describe("Testing DEFAULT_PASSWORD_POLICY (JAM-25)", function() {
	it("is 12-32, requiring a letter, a digit and a non-alphanumeric character", function() {
		expect(DEFAULT_PASSWORD_POLICY).to.deep.equal({
			minLength: 12,
			maxLength: 32,
			pattern: "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$"
		});
	});
});

describe("Testing isPasswordValid (JAM-25)", function() {
	it("rejects a password shorter than the minimum", function() {
		expect(isPasswordValid("aB1!aB1!aB1")).eq(false); // 11 chars
	});

	it("accepts a password at the minimum length", function() {
		expect(isPasswordValid("aB1!aB1!aB1!")).eq(true); // 12 chars
	});

	it("accepts a password at the maximum length", function() {
		expect(isPasswordValid("aB1!".repeat(8))).eq(true); // 32 chars
	});

	it("rejects a password longer than the maximum", function() {
		expect(isPasswordValid("aB1!".repeat(8) + "a")).eq(false); // 33 chars
	});

	it("accepts symbols - a password manager's generated output should not be rejected", function() {
		expect(isPasswordValid("Tr0ub4dor&3!@#$%")).eq(true);
	});

	it("rejects a password missing a letter", function() {
		expect(isPasswordValid("123456789012!")).eq(false);
	});

	it("rejects a password missing a digit", function() {
		expect(isPasswordValid("abcdefghijkl!")).eq(false);
	});

	it("rejects a password missing a non-alphanumeric character", function() {
		expect(isPasswordValid("abcdefghijk1")).eq(false);
	});

	it("rejects a non-string value", function() {
		expect(isPasswordValid(undefined)).eq(false);
		expect(isPasswordValid(null)).eq(false);
	});

	it("honors a custom policy when passed one", function() {
		var custom = { minLength: 4, maxLength: 6, pattern: "^.*$" };
		expect(isPasswordValid("abcd", custom)).eq(true);
		expect(isPasswordValid("abc", custom)).eq(false);
		expect(isPasswordValid("abcdefg", custom)).eq(false);
	});
});
