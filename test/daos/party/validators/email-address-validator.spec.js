/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

var chai = require("chai");
var expect = chai.expect;
var EmailAddress = require("janux-people").EmailAddress;
var EmailValidator = require("../../../../dist/index").EmailValidator;
const emailAddress = "glarus@gmail.com";

describe("Testing email address validator", function() {
	describe("When calling the method with correct email", function() {
		it("The method should not return any error", function() {
			var email = new EmailAddress(emailAddress);
			var errors = EmailValidator.validateEmail(email);
			expect(errors.length).eq(0);
		});
	});

	describe("When calling the method with an empty email address", function() {
		it("The method should return an error", function() {
			var email = new EmailAddress("  ");
			var errors = EmailValidator.validateEmail(email);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(EmailValidator.EMAIL_ADDRESS);
			expect(errors[0].message).eq(EmailValidator.EMAIL_EMPTY);
		});
	});

	describe("When calling the method with an invalid email address", function() {
		it("The method should return an error", function() {
			var email = new EmailAddress("email.com");
			var errors = EmailValidator.validateEmail(email);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(EmailValidator.EMAIL_ADDRESS);
			expect(errors[0].message).eq(EmailValidator.EMAIL_INVALID);
		});
	});
});
