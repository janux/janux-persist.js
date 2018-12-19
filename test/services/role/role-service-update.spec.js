/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-13
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var Role = require("janux-authorize").Role;
var RoleService = require("../../../dist/index").RoleService;
var DaoUtil = require("../../daos/dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

const ROLE_NAME = "HUMAN_RESOURCES_MANAGER";
const ROLE_DESCR = "Can view, modify, create and delete personnel records";
const ROLE_NAME2 = "ANOTHER_ROLE";
const ROLE_DESCR2 = "Another role in the system";
const newDescription = "New role description";

describe("Testing role service update method", function() {
	var insertedRecord1;
	var insertedRecord2;
	var roleDao;
	var roleService;

	beforeEach(function(done) {
		roleDao = DaoUtil.createRoleDao(dbEngine, dbPath);
		roleService = RoleService.createInstance(roleDao);

		// Wait for lokijs to initialize
		setTimeout(function() {
			roleDao
				.removeAll()
				.then(function() {
					var role1 = Role.createInstance(ROLE_NAME, ROLE_DESCR);
					var role2 = Role.createInstance(ROLE_NAME2, ROLE_DESCR2);
					return roleDao.insertMany([role1, role2]);
				})
				.then(function(result) {
					insertedRecord1 = result[0];
					insertedRecord2 = result[1];
					done();
				});
		}, 50);
	});

	describe("When updating a role", function() {
		it("It should not return any error", function(done) {
			insertedRecord1.description = newDescription;

			roleService
				.update(insertedRecord1)
				.then(function(result) {
					//Perform a query with the same id.
					return roleDao.findOne(insertedRecord1.id);
				})
				.then(function(resultQuery) {
					expect(resultQuery.id).eq(insertedRecord1.id);
					expect(resultQuery.description).eq(newDescription);
					done();
				});
		});
	});

	describe("When updating the order of the roles", function() {
		it("It should not return any error", function(done) {
			var rolesRefToUpdate = [
				{
					id: insertedRecord1.id,
					sortOrder: 3
				},
				{
					id: insertedRecord2.id,
					sortOrder: 4
				}
			];

			roleService
				.updateSortOrder(rolesRefToUpdate)
				.then(function(result) {
					//Perform a query with the same id.
					return roleDao.findOne(insertedRecord1.id);
				})
				.then(function(resultQuery) {
					expect(resultQuery.id).eq(insertedRecord1.id);
					expect(resultQuery.sortOrder).eq(3);
					done();
				});
		});
	});

	describe("When updating a role with a duplicated name", function() {
		it("The method should return an error", function(done) {
			insertedRecord1.name = ROLE_NAME2; // already exists

			roleService
				.update(insertedRecord1)
				.then(function(result) {
					//Perform a query with the same id.
					return roleDao.findOne(insertedRecord1.id);
				})
				.catch(function(err) {
					expect(err.length).eq(1);
					expect(err[0].attribute).eq("name");
					done();
				});
		});
	});
});
