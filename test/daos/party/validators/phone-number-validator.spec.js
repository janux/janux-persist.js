/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

var chai = require('chai');
var expect = chai.expect;
var PhoneNumber = require("janux-people").PhoneNumber;
var PhoneNumberValidator = require("../../../../dist/index").PhoneNumberValidator;


var type = "work";
var primary = true;
var number = "55-55-55-55";

describe("Testing phone number validator", function () {


	describe("When validating with correct data", function () {
		it("The method should not return an error", function () {
			var phone = new PhoneNumber(number);
			var errors = PhoneNumberValidator.validatePhoneNumber(phone);
			expect(errors.length).eq(0);
		});
	});

	describe("When validating with empty phone number", function () {
		it("The method should not return an error", function () {
			var phone = new PhoneNumber("  ");
			var errors = PhoneNumberValidator.validatePhoneNumber(phone);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(PhoneNumberValidator.CONTACT_PHONE);
			expect(errors[0].message).eq(PhoneNumberValidator.NUMBER_EMPTY);
		});
	});
});
