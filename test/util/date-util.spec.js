/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var DateUtil = require("../../dist/index").DateUtil;

describe("Testing DateUtil.stringToDate", function() {
	describe("When sending a null value", function() {
		it("returns undefined", function() {
			expect(DateUtil.stringToDate(null)).eq(undefined);
		});
	});

	describe("When sending an undefined value", function() {
		it("returns undefined", function() {
			expect(DateUtil.stringToDate(undefined)).eq(undefined);
		});
	});

	describe("When sending an already-Date object", function() {
		it("returns the same object, unchanged", function() {
			var date = new Date();
			expect(DateUtil.stringToDate(date)).eq(date);
		});
	});

	describe("When sending a blank string", function() {
		it("returns undefined", function() {
			expect(DateUtil.stringToDate("   ")).eq(undefined);
		});
	});

	describe("When sending a valid date string", function() {
		it("returns the equivalent Date object", function() {
			var result = DateUtil.stringToDate("2020-01-15");
			expect(result).instanceOf(Date);
			// Local getters, not UTC ones: moment parses a bare "2020-01-15" as local
			// midnight, so asserting via getUTC*() would be timezone-dependent.
			expect(result.getFullYear()).eq(2020);
			expect(result.getMonth()).eq(0);
			expect(result.getDate()).eq(15);
		});
	});

	describe("When sending a string moment.js can't parse into a date", function() {
		it("throws, rather than returning an invalid date silently", function() {
			expect(function() {
				DateUtil.stringToDate("not a date");
			}).to.throw(Error);
		});
	});
});
