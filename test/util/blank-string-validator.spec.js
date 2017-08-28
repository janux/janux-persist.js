/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
var chai = require('chai');
var expect = chai.expect;
//Config files
var isBlankString = require("../../dist/index").isBlankString;

describe("Testing blank string validator", function () {

    describe("When sending an string", function () {
        it("The method should return false",function () {
            expect(isBlankString("hello")).eq(false);
        })
    });

    describe("When sending a null value", function () {
        it("The method should return true", function () {
            expect(isBlankString(null)).eq(true);
        });
    });

    describe("When sending a undefined value", function () {
        it("The method should return true", function () {
            expect(isBlankString(undefined)).eq(true);
        });
    });

    describe("When sending an array", function () {
        it("The method should return true", function () {
            expect(isBlankString([])).eq(true);
        });
    });

    describe("When sending an object", function () {
        it("The method should return true", function () {
            expect(isBlankString({})).eq(true);
        });
    });

    describe("When sending an empty value", function () {
        it("The method should return true", function () {
            expect(isBlankString("")).eq(true);
        });
    });

    describe("When sending an empty value with spaces", function () {
        it("The method should return true", function () {
            expect(isBlankString("   ")).eq(true);
        });
    });
});
