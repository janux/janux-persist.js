/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
//Config files
var serverAppContext = config.get("serverAppContext");
var isBlank = require("../../dist/index").isBlank;

describe("Testing blank string validator", function () {
    describe("When sending a null value", function(){
        it("The method should return true",function(){
            expect(isBlank(null)).eq(true);
        });
    });

    describe("When sending a undefined value", function(){
        it("The method should return true",function(){
            expect(isBlank(undefined)).eq(true);
        });
    });

    describe("When sending an empty value", function(){
        it("The method should return true",function(){
            expect(isBlank("")).eq(true);
        });
    });

    describe("When sending an empty value with spaces", function(){
        it("The method should return true",function(){
            expect(isBlank("   ")).eq(true);
        });
    });

    describe("When sending an valid value with spaces", function(){
        it("The method should return true",function(){
            expect(isBlank("  i am a correct string  ")).eq(false);
        });
    });
});
