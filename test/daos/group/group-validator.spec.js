/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */

var GroupEntity = require("../../../dist/index").GroupEntity;
var GroupValidator = require("../../../dist/index").GroupValidator;
var chai = require("chai");
var expect = chai.expect;

describe("Testing group validator", function() {
	var name = "name";
	var type = "type";
	var code = "code";
	var description = "description";

	describe("When calling the method with correct values", function() {
		it("The method should not return any error", function() {
			var group = new GroupEntity();
			group.name = name;
			group.type = type;
			group.code = code;
			group.description = description;
			var errors = GroupValidator.validate(group);
			expect(errors.length).eq(0);
		});
	});

	describe("When calling the method with empty name", function() {
		it("The method should return any error", function() {
			var group = new GroupEntity();
			group.name = "   ";
			group.type = type;
			group.code = code;
			group.description = description;
			var errors = GroupValidator.validate(group);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(GroupValidator.NAME);
			expect(errors[0].message).eq(GroupValidator.NAME_EMPTY);
		});
	});

	describe("When calling the method with empty type", function() {
		it("The method should return any error", function() {
			var group = new GroupEntity();
			group.name = name;
			group.type = "   ";
			group.code = code;
			group.description = description;
			var errors = GroupValidator.validate(group);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(GroupValidator.TYPE);
			expect(errors[0].message).eq(GroupValidator.TYPE_EMPTY);
		});
	});

	describe("When calling the method with empty code", function() {
		it("The method should return any error", function() {
			var group = new GroupEntity();
			group.name = name;
			group.type = type;
			group.code = "  ";
			group.description = description;
			var errors = GroupValidator.validate(group);
			expect(errors.length).eq(1);
			expect(errors[0].attribute).eq(GroupValidator.CODE);
			expect(errors[0].message).eq(GroupValidator.CODE_EMPTY);
		});
	});
});
