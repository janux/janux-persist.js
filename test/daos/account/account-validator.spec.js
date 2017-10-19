/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
//Config files
var AccountValidator = require("../../../dist/index").AccountValidator;
var AccountEntity = require("../../../dist/index").AccountEntity;

const username = "userName";
const password = "password";
const contactId = "313030303030303030303030";

describe("Testing validate account", function () {

	describe("Given the account", function () {
		var account = new AccountEntity();
		account.username = username;
		account.password = password;
		account.contactId = contactId;
		it("The method should return an empty array", function () {
			var errors = AccountValidator.validateAccount(account);
			expect(errors.length).eq(0);
		});
	});


	describe("Given the account", function () {
		var account = new AccountEntity();
		account.username = "";
		account.password = "";
		it("The method should return two errors", function () {
			var errors = AccountValidator.validateAccount(account);
			expect(errors.length).eq(3);
		});
	});
});
