/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');

//Config files
var serverAppContext = config.get("serverAppContext");
var CountryEntity = require("../../../dist/index").CountryEntity;
var CountryValidator = require("../../../dist/index").CountryValidator;

describe("Testing country validator", function () {

    describe("When validating with correct values", function () {
        it("The method should not return any error", function () {
            var country = new CountryEntity("Mexico", "MX", "44", 1);
            var errors = CountryValidator.validateCountry(country);
            expect(errors.length).eq(0);
        });
    });

    describe("When validating with incorrect values", function () {
        it("The method should not return two error", function () {
            var country = new CountryEntity("   ", null, "44", "1");
            var errors = CountryValidator.validateCountry(country);
            expect(errors.length).eq(3);
        });
    });
});
