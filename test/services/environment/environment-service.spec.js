var chai = require("chai");
var _ = require("lodash");
var expect = chai.expect;
var config = require("config");
var EnvironmentService = require("../../../dist/index").EnvironmentService;

describe("Testing environment service", function() {
	describe("When calling retrieveEnvironmentInfo", function() {
		it("The method should return the correct value", function() {
			const result = EnvironmentService.getEnvironmentInfo();
			expect(result.environment).not.to.be.undefined;
			expect(result.environment).eq("development");
		});
	});
});
