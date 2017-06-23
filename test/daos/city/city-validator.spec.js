/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
//Config files
var serverAppContext = config.get("serverAppContext");
var CityEntity = require("../../../dist/index").CityEntity;
var CityValidator = require("../../../dist/index").CityValidator;

const name = "Mexico City";
const code = "CDMX";
const idStateProvince = "313030303030303030303030";

describe("Testing city validator", function () {

    describe("When calling the method with the correct values", function () {
        it("The method should not return any error", function () {
            var city = new CityEntity(name, code, idStateProvince);
            const errors = CityValidator.validateCity(city);
            expect(errors.length).eq(0);
        });
    });

    describe("When calling the method with incorrect values", function () {
        it("The method should not return any error", function () {
            var city = new CityEntity("  ", "  ", "  ");
            const errors = CityValidator.validateCity(city);
            expect(errors.length).eq(3);
        });
    });
});
