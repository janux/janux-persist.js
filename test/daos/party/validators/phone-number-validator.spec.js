/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

var chai = require('chai');
var expect = chai.expect;
var PhoneNumber = require("../../../../dist/index").PhoneNumber;
var PhoneNumberValidator = require("../../../../dist/index").PhoneNumberValidator;

describe("Testing phone number validator", function () {


    describe("When validating with correct data", function () {
        it("The method should not return an error", function () {
            var phone = new PhoneNumber("home", false, "55-55-55-55", undefined, undefined, undefined);
            var errors = PhoneNumberValidator.validatePhoneNumber(phone);
            expect(errors.length).eq(0);
        });
    });

    describe("When calling the method with an empty type", function () {
        it("The method should return an error", function () {
            var phone = new PhoneNumber("  ", false, "55-55-55-55", undefined, undefined, undefined);
            var errors = PhoneNumberValidator.validatePhoneNumber(phone);
            expect(errors.length).eq(1);
            expect(errors[0].attribute).eq("contact.phone.type");
        })
    });

    describe("When calling the method with an invalid primary flag", function () {
        it("The method should return an error", function () {
            var phone = new PhoneNumber("home", undefined, "55-55-55-55", undefined, undefined, undefined);
            var errors = PhoneNumberValidator.validatePhoneNumber(phone);
            expect(errors.length).eq(1);
            expect(errors[0].attribute).eq("contact.phone.primary");
        })
    });

    describe("When validating with empty phone number", function () {
        it("The method should not return an error", function () {
            var phone = new PhoneNumber("home", false, "  ", undefined, undefined, undefined);
            var errors = PhoneNumberValidator.validatePhoneNumber(phone);
            expect(errors.length).eq(1);
            expect(errors[0].attribute).eq(PhoneNumberValidator.CONTACT_PHONE);
            expect(errors[0].message).eq(PhoneNumberValidator.NUMBER_EMPTY);
        });
    });
});
