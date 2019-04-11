var chai = require("chai");
var expect = chai.expect;

var PasswordService = require("../../../dist/index").PasswordService;
var passwordService = new PasswordService();

const password = "1234567890";
const hash = "e807f1fcf82d132f9bb018ca6738a19f";

describe("Testing password service", function() {
	describe("When calling hashPassword", function() {
		it("The method should work", function() {
			var result = passwordService.hashPassword(password);
			expect(result).eq(hash);
		});
	});

	describe("When calling isValidPassword", function() {
		it("The method should work", function() {
			const value = passwordService.isValidPassword(hash, password);
			expect(value).eq(true);
		});
	});
});
