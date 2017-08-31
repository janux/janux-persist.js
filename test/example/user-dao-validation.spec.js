/**
 * Project janux-persistence
 * Created by ernesto on 5/29/17.
 */

'use strict';
require('bluebird');
var chai = require('chai');
var expect = chai.expect;
var log4js = require('log4js');
var ExampleUser = require("../../dist/index").ExampleUser;
var validateExampleUser = require("../../dist/index").validateExampleUser;

const incorrectEmail = "jonSmith.com";
const lastName = "Smith";

describe("Testing user example dao validation", function () {
	describe("When validating with incorrect email", function () {
		it("Should have sent the error message", function () {
			var user = new ExampleUser("", lastName, incorrectEmail);
			var errors = validateExampleUser(user);
			expect(errors.length).eq(2);
			expect(errors[0].attribute).eq('name');
			expect(errors[1].attribute).eq('email');
		});
	});
});
