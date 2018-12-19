/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

var chai = require("chai");
var expect = chai.expect;
var PostalAddress = require("janux-people").PostalAddress;
var PostalAddressValidator = require("../../../../dist/index").PostalAddressValidator;

const home = "home";
const work = "work";
const line1 = "An address";
const cityText = "Mexico city";
const postalCode = "05000";
const stateText = "CDMX";

describe("Testing postal address validator", function() {
	describe("When calling the method with valid data", function() {
		it("The method should not return an error", function() {
			var postalAddress = new PostalAddress();
			postalAddress.line1 = line1;
			postalAddress.cityText = cityText;
			postalAddress.postalCode = postalCode;
			postalAddress.stateText = stateText;
			var error = PostalAddressValidator.validatePostalAddress(postalAddress);
			expect(error.length).eq(0);
		});
	});

	/*describe("When calling the method with an empty line1", function () {
        it("The method should return an error", function () {
            var postalAddress = new PostalAddress(
                home,
                true,
                "  ",
                "",
                "",
                cityText,
                null,
                postalCode,
                stateText,
                null,
                countryIsoCode);
            var error = PostalAddressValidator.validatePostalAddress(postalAddress);
            expect(error.length).eq(1);
            expect(error[0].attribute).eq(PostalAddressValidator.LINE_1);
            expect(error[0].message).eq(PostalAddressValidator.LINE_1_EMPTY);
        });
    });

    describe("When calling the method with an empty postal code", function () {
        it("The method should return an error", function () {
            var postalAddress = new PostalAddress(
                home,
                true,
                line1,
                "",
                "",
                cityText,
                null,
                "  ",
                stateText,
                null,
                countryIsoCode);
            var error = PostalAddressValidator.validatePostalAddress(postalAddress);
            expect(error.length).eq(1);
            expect(error[0].attribute).eq(PostalAddressValidator.POSTAL_CODE);
            expect(error[0].message).eq(PostalAddressValidator.POSTAL_CODE_EMPTY);
        });
    });

    describe("When calling the method with an empty countryIsoCode", function () {
        it("The method should return an error", function () {
            var postalAddress = new PostalAddress(
                home,
                true,
                line1,
                "",
                "",
                cityText,
                null,
                postalCode,
                stateText,
                null,
                "  ");
            var error = PostalAddressValidator.validatePostalAddress(postalAddress);
            expect(error.length).eq(1);
            expect(error[0].attribute).eq(PostalAddressValidator.COUNTRY);
            expect(error[0].message).eq(PostalAddressValidator.COUNTRY_EMPTY);
        });
    });


    describe("When calling the method with an empty idStateProvince and stateText null", function () {
        it("The method should return an error", function () {
            var postalAddress = new PostalAddress(
                home,
                true,
                line1,
                "",
                "",
                cityText,
                null,
                postalCode,
                "  ",
                null,
                countryIsoCode);
            var error = PostalAddressValidator.validatePostalAddress(postalAddress);
            expect(error.length).eq(1);
            expect(error[0].attribute).eq(PostalAddressValidator.STATE_TEXT);
            expect(error[0].message).eq(PostalAddressValidator.STATE_TEXT_EMPTY);
        });
    });

    describe("When calling the method with both idStateProvince and stateText not null", function () {
        it("The method should return an error", function () {
            var postalAddress = new PostalAddress(
                home,
                true,
                line1,
                "",
                "",
                cityText,
                null,
                postalCode,
                undefined,
                idStateProvince,
                countryIsoCode);
            var error = PostalAddressValidator.validatePostalAddress(postalAddress);
            expect(error.length).eq(1);
            expect(error[0].attribute).eq(PostalAddressValidator.STATE_TEXT);
            expect(error[0].message).eq(PostalAddressValidator.STATE_TEXT_NOT_NULL);
        });
    });

    describe("When calling the method with idStateProvince undefined (when it must be null)", function () {
        it("The method should return an error", function () {
            var postalAddress = new PostalAddress(
                home,
                true,
                line1,
                "",
                "",
                cityText,
                null,
                postalCode,
                stateText,
                undefined,
                countryIsoCode);
            var error = PostalAddressValidator.validatePostalAddress(postalAddress);
            expect(error.length).eq(1);
            expect(error[0].attribute).eq(PostalAddressValidator.ID_STATE_PROVINCE);
            expect(error[0].message).eq(PostalAddressValidator.ID_STATE_PROVINCE_NOT_NULL);
        });
    });

    describe("When calling the method with an empty idCity and cityText null", function () {
        it("The method should return an error", function () {
            var postalAddress = new PostalAddress(
                home,
                true,
                line1,
                "",
                "",
                "  ",
                null,
                postalCode,
                stateText,
                null,
                countryIsoCode);
            var error = PostalAddressValidator.validatePostalAddress(postalAddress);
            expect(error.length).eq(1);
            expect(error[0].attribute).eq(PostalAddressValidator.CITY_TEXT);
            expect(error[0].message).eq(PostalAddressValidator.CITY_TEXT_EMPTY);
        });
    });

    describe("When calling the method with idCity undefined (when it must be null)", function () {
        it("The method should return an error", function () {
            var postalAddress = new PostalAddress(
                home,
                true,
                line1,
                "",
                "",
                cityText,
                undefined,
                postalCode,
                stateText,
                null,
                countryIsoCode);
            var error = PostalAddressValidator.validatePostalAddress(postalAddress);
            expect(error.length).eq(1);
            expect(error[0].attribute).eq(PostalAddressValidator.ID_CITY);
            expect(error[0].message).eq(PostalAddressValidator.ID_CITY_NOT_NULL);
        });
    });

    describe("When calling the method with both idCity and cityText not null", function () {
        it("The method should return an error", function () {
            var postalAddress = new PostalAddress(
                home,
                true,
                line1,
                "",
                "",
                undefined,
                idCity,
                postalCode,
                stateText,
                null,
                countryIsoCode);
            var error = PostalAddressValidator.validatePostalAddress(postalAddress);
            expect(error.length).eq(1);
            expect(error[0].attribute).eq(PostalAddressValidator.CITY_TEXT);
            expect(error[0].message).eq(PostalAddressValidator.CITY_TEXT_NOT_NULL);
        });
    });*/
});
