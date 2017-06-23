/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */
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
var PersonEntity = require("../../../../dist/index").PersonEntity;
var PersonValidator = require("../../../../dist/index").PersonValidator;
var PartyValidator = require("../../../../dist/index").PartyValidator;

const name = "John";
const middleName = "Doe";

describe("Person validator", function () {

    describe("When validating with empty name and middle name", function () {
        it("The method should return the errors", function () {
            var person = new PersonEntity();
            person.name.first = " ";
            person.name.middle = " ";
            person.type = PartyValidator.PERSON;
            var errors = PersonValidator.validatePerson(person);
            expect(errors.length).eq(2);
            expect(errors[0].attribute).eq(PersonValidator.NAME_FIRST);
            expect(errors[1].attribute).eq(PersonValidator.NAME_MIDDLE);
        });
    });

    describe("When validating with valid data", function () {
        it("The method should not return any error", function () {
            var person = new PersonEntity();
            person.name.first = name;
            person.name.middle = middleName;
            person.type = PartyValidator.PERSON;
            var errors = PersonValidator.validatePerson(person);
            expect(errors.length).eq(0);
        });
    });
});
