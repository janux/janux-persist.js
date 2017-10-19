/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-13
 */
var chai = require('chai');
var expect = chai.expect;
//Config files
var RoleValidator = require("../../../dist/index").RoleValidator;
var Role = require("janux-authorize").Role;

const ROLE_NAME = 'HUMAN_RESOURCES_MANAGER';
const ROLE_DESC = 'Can view, modify, create and delete personel records';

describe("Testing validate role", function () {

	describe("Given the role", function () {
		var role = Role.createInstance(ROLE_NAME, ROLE_DESC);

		it("The method should return an empty array", function () {
			var errors = RoleValidator.validateRole(role);
			expect(errors.length).eq(0);
		});
	});
});
