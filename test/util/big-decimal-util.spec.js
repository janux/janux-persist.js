/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var index = require("../../dist/index");
var BigDecimalUtil = index.BigDecimalUtil;
var Big = require("big.js");

describe("Testing BigDecimalUtil.toBigDecimal128", function() {
	describe("When called with a valid precision", function() {
		it("fixes the value to that many decimals before converting", function() {
			var value = new Big("1.23456");
			var result = BigDecimalUtil.toBigDecimal128(value, 2);
			expect(result.toString()).eq("1.23");
		});
	});
});

describe("Testing BigDecimalUtil.toNumber", function() {
	describe("When called with a valid precision", function() {
		it("fixes the value to that many decimals before converting", function() {
			var value = new Big("1.23456");
			expect(BigDecimalUtil.toNumber(value, 2)).eq(1.23);
		});
	});
});
