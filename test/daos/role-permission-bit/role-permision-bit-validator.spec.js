/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */

var chai = require('chai');
var expect = chai.expect;
var config = require('config');
//Config files
var serverAppContext = config.get("serverAppContext");
var RolePermissionBitEntity = require("../../../dist/index").RolePermissionBitEntity;
var RolePermissionBitValidator = require("../../../dist/index").RolePermissionBitValidator;

describe("Testing RolePermissionBit validator", function () {
    describe("When calling the method with the correct values", function () {
        it("The method should no return an error", function () {
            var rolePermission = new RolePermissionBitEntity("1000000", "1000000");
            var errors = RolePermissionBitValidator.validateRolePermissionBit(rolePermission);
            expect(errors.length).eq(0);
        });
    });

    describe("When calling the method with incorrect values", function () {
        it("The method should no return an error", function () {
            var rolePermission = new RolePermissionBitEntity("   ", "   ");
            var errors = RolePermissionBitValidator.validateRolePermissionBit(rolePermission);
            expect(errors.length).eq(2);
        });
    });
});
