/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-13
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var Role = require("janux-authorize").Role;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const ROLE_NAME = "HUMAN_RESOURCES_MANAGER";
const ROLE_DESCR = "Can view, modify, create and delete personnel records";
const ROLE_NAME2 = "ANOTHER_ROLE";
const ROLE_DESCR2 = "Another role in the system";
const ROLE_NAME3 = "NOTEXISTS";
const invalidId = "313030303030303030300000";

describe("Testing role dao find methods", function() {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function(dbEngine) {
		describe("Given the inserted records", function() {
			var insertedId;
			var insertedId2;
			var roleDao;
			beforeEach(function(done) {
				var path =
					dbEngine === DataSourceHandler.LOKIJS
						? serverAppContext.db.lokiJsDBPath
						: serverAppContext.db.mongoConnUrl;
				roleDao = DaoUtil.createRoleDao(dbEngine, path);
				roleDao
					.removeAll()
					.then(function() {
						var role1 = Role.createInstance(ROLE_NAME, ROLE_DESCR);
						var role2 = Role.createInstance(ROLE_NAME2, ROLE_DESCR2);
						return roleDao.insertMany([role1, role2]);
					})
					.then(function(result) {
						insertedId = result[0].id;
						insertedId2 = result[1].id;
						done();
					});
			});

			describe("When looking for an role by name", function() {
				it("It should return one record", function(done) {
					roleDao.findOneByName(ROLE_NAME).then(function(result) {
						expect(result).not.to.be.null;
						expect(result.name).eq(ROLE_NAME);
						expect(result.description).eq(ROLE_DESCR);
						done();
					});
				});
			});

			describe("When looking for an incorrect name", function() {
				it("It should return null", function(done) {
					roleDao.findOneByName(ROLE_NAME3).then(function(result) {
						expect(result).to.be.null;
						done();
					});
				});
			});

			describe("When looking for an id in the database", function() {
				it("It should return one record", function(done) {
					roleDao.findOne(insertedId).then(function(result) {
						expect(result).not.to.be.null;
						done();
					});
				});
			});

			describe("When looking for an id that doesn't exist in the database", function() {
				it("It should return null", function(done) {
					roleDao.findOne(invalidId).then(function(result) {
						expect(result).to.be.null;
						done();
					});
				});
			});

			describe("When looking for several id-s (correct and incorrect)", function() {
				it("It should return an array", function(done) {
					roleDao.findByIdsMethod([insertedId, insertedId2]).then(function(result) {
						expect(result.length).eq(2);
						done();
					});
				});

				it("It should return an array with ony one result", function(done) {
					roleDao.findByIdsMethod([insertedId, invalidId]).then(function(result) {
						expect(result.length).eq(1);
						done();
					});
				});

				it("It should return an empty array", function(done) {
					roleDao.findByIdsMethod([invalidId]).then(function(result) {
						expect(result.length).eq(0);
						done();
					});
				});
			});

			describe("When counting", function() {
				it("Should return 2", function(done) {
					roleDao.count().then(function(result) {
						expect(result).eq(2);
						done();
					});
				});
			});
		});
	});
});
