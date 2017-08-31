/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */

var GroupValueEntity = require("../../../dist/index").GroupContentEntity;
var GroupValueValidator = require("../../../dist/index").GroupContentValidator;
var chai = require('chai');
var expect = chai.expect;

describe("Testing group value validator", function () {

	var idGroup = "idGroup";
	var objectGroup = "value";

	describe("When calling the method with correct values", function () {
		it("The method should not return any error", function () {
			var groupValue = new GroupValueEntity();
			groupValue.idGroup = idGroup;
			groupValue.value = objectGroup;
			var errors = GroupValueValidator.validate(groupValue);
			expect(errors.length).eq(0);
		})
	});

	describe("When calling the method with empty idGroup", function () {
		it("The method should return any error", function () {
			var groupValue = new GroupValueEntity();
			groupValue.idGroup = "   ";
			groupValue.value = objectGroup;
			var errors = GroupValueValidator.validate(groupValue);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(GroupValueValidator.ID_GROUP);
			expect(errors[0].message).eq(GroupValueValidator.ID_GROUP_EMPTY);
		})
	});

	describe("When calling the method with undefined value", function () {
		it("The method should return any error", function () {
			var groupValue = new GroupValueEntity();
			groupValue.idGroup = idGroup;
			groupValue.value = undefined;
			var errors = GroupValueValidator.validate(groupValue);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(GroupValueValidator.OBJECT_GROUP);
			expect(errors[0].message).eq(GroupValueValidator.OBJECT_GROUP_EMPTY);
		})
	});

	describe("When calling the method with null value", function () {
		it("The method should return any error", function () {
			var groupValue = new GroupValueEntity();
			groupValue.idGroup = idGroup;
			groupValue.value = null;
			var errors = GroupValueValidator.validate(groupValue);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(GroupValueValidator.OBJECT_GROUP);
			expect(errors[0].message).eq(GroupValueValidator.OBJECT_GROUP_EMPTY);
		})
	});
});
