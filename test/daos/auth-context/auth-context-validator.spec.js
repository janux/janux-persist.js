/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
//Config files
var serverAppContext = config.get("serverAppContext");
var AuthContextValidator = require("../../../dist/index").AuthContextValidator;
var AuthorizationContext = require("janux-authorize").AuthorizationContext;

describe("Testing validate authorization context", function () {

	describe("Given the authorization context", function () {
		var authContext = AuthorizationContext.createInstance('PERSON', 'Defines permissions available on a Person entity');

		it("The method should return an empty array", function () {
			var errors = AuthContextValidator.validateAuthContext(authContext);
			expect(errors.length).eq(0);
		});
	});
});