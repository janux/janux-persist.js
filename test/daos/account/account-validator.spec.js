/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
//Config files
var serverAppContext = config.get("serverAppContext");
var AccountValidator = require("../../../dist/index").AccountValidator;
var Account = require("../../../dist/index").Account;

const username = "userName";
const password = "password";

describe("Testing validate account", function () {
    describe("Given the account", function () {
        var account = new Account();
        account.username = username;
        account.password = password;

        it("The method should return an empty array", function () {
            var errors = AccountValidator.validateAccount(account);
            expect(errors.length).eq(0);
        });
    });

    describe("Given the account", function () {
        var account = new Account();
        account.username = "";
        account.password = "";

        it("The method should return two errors", function () {
            var errors = AccountValidator.validateAccount(account);
            expect(errors.length).eq(2);
        });
    });
});
