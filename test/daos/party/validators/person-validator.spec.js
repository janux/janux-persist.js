/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */
/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var config = require("config");
//Config files
var serverAppContext = config.get("serverAppContext");
var PersonEntity = require("janux-people").Person;
var PersonValidator = require("../../../../dist/index").PersonValidator;

const honorificPrefix = "Mr.";
const name = "John";
const middleName = "Doe";

describe("Person validator", function() {
	describe("When validating with empty name", function() {
		it("The method should return the errors", function() {
			var person = new PersonEntity(honorificPrefix, " ", " ", "");
			var errors = PersonValidator.validatePerson(person);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(PersonValidator.NAME_FIRST);
		});
	});

	describe("When validating with valid data", function() {
		it("The method should not return any error", function() {
			var person = new PersonEntity(honorificPrefix, name, middleName, "");
			var errors = PersonValidator.validatePerson(person);
			expect(errors.length).eq(0);
		});
	});
});
