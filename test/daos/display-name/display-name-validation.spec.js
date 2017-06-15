/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');

//Config files
var serverAppContext = config.get("serverAppContext");
var DisplayName = require("../../../dist/index").DisplayNameEntity;
var displayNameValidator = require("../../../dist/index").DisplayNameValidator;

describe("Testing display name validation", function () {
    describe("When validating a correct entity", function () {
        it("It should return no errors", function () {
            var displayName = new DisplayName();
            displayName.displayName = "A name";
            var errors = displayNameValidator.validateDisplayName(displayName);
            expect(errors.length).eq(0);
        });
    });
});

describe("Testing display name validation", function () {
    describe("When validate an invalid", function () {
        it("It should return no errors", function () {
            var displayName = new DisplayName();
            displayName.displayName = "";
            var errors = displayNameValidator.validateDisplayName(displayName);
            expect(errors.length).eq(1);
        });
    });
});
