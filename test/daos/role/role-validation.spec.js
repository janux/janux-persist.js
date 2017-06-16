/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
//Config files
var serverAppContext = config.get("serverAppContext");
var RoleValidator = require("../../../dist/index").RoleValidator;
var Role = require("../../../dist/index").RoleEntity;


describe("Testing role validation", function () {
    describe("When validation a role with the correct value", function () {
        it("The method should return an empty array", function () {
            var role = new Role("role", "role description", false);
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(0);
        });
    });

    describe("When validation a role with incorrect values", function () {
        it("The method should return an array of errors", function () {
            var role = new Role(null, null, false);
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(2);
        });
    });
});
