/**
 * Project janux-persist.js
 * Created by alejandro janux on 2017-09-26
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');

var DaoUtil = require("../../daos/dao-util");
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const AuthContextGroupService = require("../../../dist/index").AuthContextGroupServiceImpl;
const GroupService = require("../../../dist/index").GroupServiceImpl;
const GroupImpl = require("../../../dist/index").GroupImpl;
const GroupServiceValidator = require("../../../dist/index").GroupServiceValidator;
const AuthContextService = require("../../../dist/index").AuthContextService;

//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;

// Test values
const SampleAuthContexts = require("../auth-context/auth-context.json");
const name = 'auth context display group';
const code = 'code';
const name2 = 'auth context display group 2';
const code2 = 'code2';
const attributes2 = {parent: "janux", system: "true"};
const attributes = {parent: "root"};

describe("Testing authContext groups service remove methods", function () {

	var groupContentDao;
	var authContextDao;
	var groupDao;
	var groupAttributeValueDao;
	var groupService;
	var authContextService;
	var authContextGroupService;

	var insertedAuthContext1;
	var insertedAuthContext2;

	beforeEach(function (done) {
		authContextDao = DaoUtil.createAuthContextDao(dbEngine, path);
		groupContentDao = DaoUtil.createGroupContentDao(dbEngine, path);
		groupDao = DaoUtil.createGroupDao(dbEngine, path);
		groupAttributeValueDao = DaoUtil.createGroupAttributesDao(dbEngine, path);
		groupService = new GroupService(groupDao, groupContentDao, groupAttributeValueDao);
		authContextService = AuthContextService.createInstance(authContextDao);
		authContextGroupService = new AuthContextGroupService(authContextService, groupService);
		setTimeout(function () {
			// Delete all records.
			authContextDao.removeAll()
				.then(function () {
					return groupAttributeValueDao.removeAll();
				})
				.then(function () {
					return groupContentDao.removeAll();
				})
				.then(function () {
					return groupDao.removeAll();
				})
				.then(function () {
					// Insert authContexts
					return authContextService.insert(SampleAuthContexts[0]);
				})
				.then(function (insertedAuthContext) {
					insertedAuthContext1 = insertedAuthContext;
					return authContextService.insert(SampleAuthContexts[1]);

				})
				.then(function (insertedAuthContext) {
					insertedAuthContext2 = insertedAuthContext;

					var group = new GroupImpl();
					group.name = name;
					group.code = code;
					group.type = authContextGroupService.AUTHCONTEXT_GROUP_TYPE;
					group.attributes = attributes;
					group.values = [insertedAuthContext1];
					return authContextGroupService.insert(group)
				})
				.then(function () {
					var group2 = new GroupImpl();
					group2.name = name2;
					group2.code = code2;
					group2.type = authContextGroupService.AUTHCONTEXT_GROUP_TYPE;
					group2.attributes = attributes2;
					group2.values = [insertedAuthContext2];
					return authContextGroupService.insert(group2);
				})
				.then(function () {
					done();
				})
		}, 50);

	});

	describe("When calling remove", function () {
		it("The method should remove the group", function (done) {
			authContextGroupService.remove(code2)
				.then(function () {
					return authContextGroupService.findOne(code2);
				})
				.then(function (result) {
					expect(result).to.be.null;
					return authContextGroupService.findOne(code);
				})
				.then(function (result) {
					expect(result.name).eq(name);
					expect(result.code).eq(code);
					expect(result.values.length).eq(1);
					done();
				});
		});
	});


	describe("When calling remove with invalid code", function () {
		it("The method should return an error", function (done) {
			authContextGroupService.remove("invalidCode")
				.then(function () {
					expect.fail("The method should not have removed the group");
				}, function (err) {
					expect(err).eq(GroupServiceValidator.NO_GROUP);
					done();
				})
		});
	});

	describe("When calling removeItem", function () {
		it("The method should remove the item of the group", function (done) {
			authContextGroupService.removeItem(code2, insertedAuthContext2)
				.then(function () {
					return authContextGroupService.findOne(code2);
				})
				.then(function (result) {
					expect(result.values.length).eq(0);
					done();
				});
		});
	});
});
