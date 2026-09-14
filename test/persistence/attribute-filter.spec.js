/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var AttributeFilter = require("../../dist/persistence/implementations/dao/attribute-filter").AttributeFilter;

describe("Testing AttributeFilter", function() {
	describe("When constructing with an attribute name and a value", function() {
		it("stores both as-is on the instance", function() {
			var filter = new AttributeFilter("name", "someValue");
			expect(filter.attributeName).eq("name");
			expect(filter.value).eq("someValue");
		});
	});

	describe("When constructing with a non-string value", function() {
		it("stores the value untouched, no coercion", function() {
			var filter = new AttributeFilter("age", 42);
			expect(filter.attributeName).eq("age");
			expect(filter.value).eq(42);
		});
	});
});
