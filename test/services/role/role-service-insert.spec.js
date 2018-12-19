/**
 * Project janux-persistence
 * Created by alejandro janux 2017-09-13
 */
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var config = require("config");
var RoleService = require("../../../dist/index").RoleService;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var RoleValidator = require("../../../dist/index").RoleValidator;
var DaoUtil = require("../../daos/dao-util");
var roleSample = require("./role.json");
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

const ROLE_NAME = "HUMAN_RESOURCES_MANAGER";
const ROLE_DESCR = "Can view, modify, create and delete personnel records";

describe("Testing role service insert method", function() {
	var roleDao;
	var roleService;

	beforeEach(function(done) {
		roleDao = DaoUtil.createRoleDao(dbEngine, dbPath);
		roleService = RoleService.createInstance(roleDao);
		roleDao.removeAll().then(function() {
			done();
		});
	});

	describe("When inserting a role", function() {
		it("It should not return any error", function(done) {
			roleService
				.insert(roleSample[0])
				.then(function(resultInsert) {
					return roleService.findOneById(resultInsert.id);
				})
				.then(function(result) {
					roleValidation(result);
					done();
				});
		});

		function roleValidation(entity) {
			expect(entity).to.have.property("id");
			expect(entity.name).eq(ROLE_NAME);
			expect(entity.description).eq(ROLE_DESCR);

			expect(entity.hasPermission("READ", "PERSON")).to.equal(true);
			expect(entity.hasPermissions(["READ", "UPDATE"], "PERSON")).to.equal(true);
			expect(entity.hasPermissions(["READ", "UPDATE", "TRASH"], "PERSON")).to.equal(true);
			expect(entity.hasPermission("CREATE", "PERSON")).to.equal(false);
			expect(entity.hasPermissions(["READ", "UPDATE", "CREATE"], "PERSON")).to.equal(false);
			expect(entity.hasPermissions(["READ", "UPDATE", "CREATE", "DELETE"], "PERSON")).to.equal(false);
			expect(entity.hasPermission("READ", "ACCOUNT")).to.equal(true);
			expect(entity.hasPermissions(["READ", "UPDATE"], "ACCOUNT")).to.equal(true);
			expect(entity.hasPermission("CREATE", "ACCOUNT")).to.equal(false);
			expect(entity.hasPermissions(["READ", "UPDATE", "CREATE"], "ACCOUNT")).to.equal(false);
			expect(entity.hasPermissions(["READ", "UPDATE", "CREATE", "DELETE"], "ACCOUNT")).to.equal(false);
		}
	});

	describe("When inserting a role with a duplicated name", function() {
		it("The method should return an error", function(done) {
			roleService
				.insert(roleSample[0])
				.then(function(result) {
					return roleService.insert(roleSample[0]);
				})
				.then(function(result2) {
					expect.fail("The method should not have inserted the record");
					done();
				})
				.catch(function(err) {
					expect(err.length).eq(1);
					expect(err[0].message).eq(RoleValidator.ANOTHER_NAME);
					done();
				});
		});
	});
});
