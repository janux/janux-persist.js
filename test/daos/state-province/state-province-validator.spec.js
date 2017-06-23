/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
//Config files
var serverAppContext = config.get("serverAppContext");
var StateProvinceEntity = require("../../../dist/index").StateProvinceEntity;
var StateProvinceValidator = require("../../../dist/index").StateProvinceValidator;

describe("Testing StateProvince validator", function () {
    describe("When calling the method with the correct values", function () {
        it("The method should not return error", function () {
            var stateProvince = new StateProvinceEntity("Mexico city", "CDMX", "10000000", 0);
            var error = StateProvinceValidator.validateStateProvince(stateProvince);
            expect(error.length).eq(0);
        });
    });

    describe("When calling the method with invalid values", function () {
        describe("The method should return the errors", function () {
            var stateProvince = new StateProvinceEntity("  ", "  ", "  ", "  ");
            var error = StateProvinceValidator.validateStateProvince(stateProvince);
            expect(error.length).eq(4);
        })
    });
});
