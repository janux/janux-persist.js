/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var AccountRoleValidator = require("../../../dist/index").AccountRoleValidator;
var AccountRoleEntity = require("../../../dist/index").AccountRoleEntity;

describe("Testing accountRole validator", function () {
    describe("When calling the method with the correct input", function () {
        it("It should not return an error", function () {
            var accountRoleEntity = new AccountRoleEntity();
            accountRoleEntity.idAccount = "100000";
            accountRoleEntity.idRole = "100000";
            expect(AccountRoleValidator.validatedAccountRole(accountRoleEntity).length).eq(0);
        });
    });

    describe("When calling the method with empty account id", function () {
        it("It should return one error", function () {
            var accountRoleEntity = new AccountRoleEntity();
            accountRoleEntity.idAccount = "";
            accountRoleEntity.idRole = "100000";
            expect(AccountRoleValidator.validatedAccountRole(accountRoleEntity).length).eq(1);
        });
    });

    describe("When calling the method with empty role id", function () {
        it("It should return one error", function () {
            var accountRoleEntity = new AccountRoleEntity();
            accountRoleEntity.idAccount = "10000";
            accountRoleEntity.idRole = "";
            expect(AccountRoleValidator.validatedAccountRole(accountRoleEntity).length).eq(1);
        });
    });

    describe("When calling the method with empty instance", function () {
        it("It should return two errors", function () {
            var accountRoleEntity = new AccountRoleEntity();
            expect(AccountRoleValidator.validatedAccountRole(accountRoleEntity).length).eq(2);
        });
    });
});
