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
            var role = new Role("role", "role description", false, true, undefined);
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(0);
        });

        it("The method should return an empty array", function () {
            var role = new Role("role", "role description", false, false, "100000000");
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(0);
        });
    });

    describe("When validation a role with incorrect values", function () {
        it("The method should return an array of errors", function () {
            var role = new Role("  ", "   ", null, null, undefined);
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(4);
        });

        it("The method should return an array of errors", function () {
            var role = new Role(null, null, false, undefined, undefined);
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(3);
        });

        it("The method should return an array of errors", function () {
            var role = new Role(null, null, false, "invalid", undefined);
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(3);
        });
    });


    describe("When validation a role with incorrect idParentRole and isRoot", function () {
        it("The method should return one error", function () {
            var role = new Role("role", "role description", false, false, undefined);
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(1);
        });

        it("The method should return one error", function () {
            var role = new Role("role", "role description", false, false, null);
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(1);
        });

        it("The method should return one error", function () {
            var role = new Role("role", "role description", false, false, "");
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(1);
        });

        it("The method should return one error", function () {
            var role = new Role("role", "role description", false, false, "  ");
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(1);
        });

        it("The method should return one error", function () {
            var role = new Role("role", "role description", false, true, "10000000");
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(1);
        });

        it("The method should return one error", function () {
            var role = new Role("role", "role description", false, true, null);
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(1);
        });

        it("The method should return one error", function () {
            var role = new Role("role", "role description", false, true, "   ");
            var result = RoleValidator.validateRole(role);
            expect(result.length).eq(1);
        });

    });
});
