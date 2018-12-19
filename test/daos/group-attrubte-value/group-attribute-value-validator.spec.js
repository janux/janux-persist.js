/**
 * Project janux-persistence
 * Created by ernesto on 8/31/17.
 */

var chai = require("chai");
var expect = chai.expect;

var GroupAttributeValueValidator = require("../../../dist/index").GroupAttributeValueValidator;
var GroupAttributeValueEntity = require("../../../dist/index").GroupAttributeValueEntity;

describe("Testing group attribute value validator", function() {
	describe("When calling with correct values", function() {
		it("The method should not return an error", function() {
			var attributeValue = new GroupAttributeValueEntity();
			attributeValue.idGroup = "12345";
			attributeValue.key = "name";
			attributeValue.value = "a name";
			var errors = GroupAttributeValueValidator.validate(attributeValue);
			expect(errors.length).eq(0);
		});
	});

	describe("When calling with empty idGroup", function() {
		it("The method should return one error", function() {
			var attributeValue = new GroupAttributeValueEntity();
			attributeValue.idGroup = "  ";
			attributeValue.key = "name";
			attributeValue.value = "a name";
			var errors = GroupAttributeValueValidator.validate(attributeValue);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(GroupAttributeValueValidator.ID_GROUP);
			expect(errors[0].message).eq(GroupAttributeValueValidator.ID_GROUP_EMPTY);
		});
	});

	describe("When calling with empty key", function() {
		it("The method should return one error", function() {
			var attributeValue = new GroupAttributeValueEntity();
			attributeValue.idGroup = "12345";
			attributeValue.key = "   ";
			attributeValue.value = "a name";
			var errors = GroupAttributeValueValidator.validate(attributeValue);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(GroupAttributeValueValidator.KEY);
			expect(errors[0].message).eq(GroupAttributeValueValidator.KEY_EMPTY);
		});
	});

	describe("When calling with empty value", function() {
		it("The method should return one error", function() {
			var attributeValue = new GroupAttributeValueEntity();
			attributeValue.idGroup = "12345";
			attributeValue.key = "name";
			attributeValue.value = "     ";
			var errors = GroupAttributeValueValidator.validate(attributeValue);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(GroupAttributeValueValidator.VALUE);
			expect(errors[0].message).eq(GroupAttributeValueValidator.VALUE_EMPTY);
		});
	});
});
