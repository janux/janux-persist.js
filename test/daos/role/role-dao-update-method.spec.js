/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-13
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var Role = require("janux-authorize").Role;
var DaoFactory = require("../../../dist/index").DaoFactory;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

const ROLE_NAME = 'HUMAN_RESOURCES_MANAGER';
const ROLE_DESCR = 'Can view, modify, create and delete personnel records';
const ROLE_NAME2 = 'ANOTHER_ROLE';
const ROLE_DESCR2 = 'Another role in the system';
const newDescription =  'New role description';

//Config files
var serverAppContext = config.get("serverAppContext");

describe("Testing role dao update methods", function () {
	[DataSourceHandler.LOKIJS, DataSourceHandler.MONGOOSE].forEach(function (dbEngine) {

		describe("Given the inserted records", function () {
			var roleDao;
			var insertedRecord1;
			var insertedRecord2;

			beforeEach(function (done) {
				var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
				roleDao = DaoFactory.createRoleDao(dbEngine, path);
				
				roleDao.removeAll()
					.then(function () {
						var role1 = Role.createInstance(ROLE_NAME, ROLE_DESCR);
						var role2 = Role.createInstance(ROLE_NAME2, ROLE_DESCR2);

						return roleDao.insertMany([role1, role2])
					})
					.then(function (result) {
						insertedRecord1 = result[0];
						insertedRecord2 = result[1];
						done();
					});

			});

			describe("When updating a role", function () {
				it("It should not send an error", function (done) {
					insertedRecord1.description = newDescription;
					roleDao.update(insertedRecord1)
						.then(function (res) {
							//Perform a query with the same id.
							return roleDao.findOne(res.id);
						})
						.then(function (resultQuery) {
							expect(resultQuery.id).eq(insertedRecord1.id);
							expect(resultQuery.description).eq(newDescription);
							done();
						})
						.catch(function (err) {
							expect.fail("Error");
							done();
						});
				})
			});

			describe("When updating a role without an id", function () {
				it("It should return an error", function (done) {
					var role = Role.createInstance(ROLE_NAME, ROLE_DESCR);
					roleDao.update(role)
						.then(function (res) {
							assert.fail("The method should not have updated the record");
							done();
						}, function (err) {
							assert("The method sent an error, is ok", err);
							done();
						});
				})
			});

			describe("When updating a role with a duplicated name", function () {
				it("It should send an error", function (done) {
					insertedRecord1.name = ROLE_NAME2;
					roleDao.update(insertedRecord1)
						.then(function (res) {
							assert.fail("The method should not have updated the record");
							done();
						}, function (err) {
							assert("The method sent an error, is ok", err);
							expect(err.length).eq(1);
							expect(err[0].attribute).eq("name");
							done();
						});
				})
			});
		});
	})
});
