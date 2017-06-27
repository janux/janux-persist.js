/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
//Config files
var serverAppContext = config.get("serverAppContext");
var AuthContextEntity = require("../../../dist/index").AuthContextEntity;
var AuthContextValidator = require("../../../dist/index").AuthContextValidator;

const name = "A name";
const description = "A description ";
const sortOrder = 1;
const enabled = true;
const idDisplayName = "313030303030303030303038";


describe("Testing auth context validation", function () {
    describe("When calling the method with correct values", function () {
        it("The method should not return an error", function () {
            var authContext = new AuthContextEntity(name, description, sortOrder, enabled, idDisplayName);
            var errors = AuthContextValidator.validateAuthContext(authContext);
            expect(errors.length).eq(0);
        });
    });

    describe("When calling the method with incorrect values values", function () {
        it("The method should return an error", function () {
            var authContext = new AuthContextEntity("  ", "  ", sortOrder, enabled, " ");
            var errors = AuthContextValidator.validateAuthContext(authContext);
            expect(errors.length).eq(3);
        });

        it("The method should return an error", function () {
            var authContext = new AuthContextEntity(name, description, "123", enabled, idDisplayName);
            var errors = AuthContextValidator.validateAuthContext(authContext);
            expect(errors.length).eq(1);
        });

        it("The method should return an error", function () {
            var authContext = new AuthContextEntity(name, description, 123, "false", idDisplayName);
            var errors = AuthContextValidator.validateAuthContext(authContext);
            expect(errors.length).eq(1);
        });
    });
});
