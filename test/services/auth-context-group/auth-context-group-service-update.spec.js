/**
 * Project janux-persist.js
 * Created by alejandro janux on 2017-09-26
 */

var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');
var config = require('config');

var DaoUtil = require("../../daos/dao-util");
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const AuthContextGroupService = require("../../../dist/index").AuthContextGroupServiceImpl;
const GroupService = require("../../../dist/index").GroupServiceImpl;
const GroupImpl = require("../../../dist/index").GroupImpl;
const AuthContextService = require("../../../dist/index").AuthContextService;

//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;

// Test Values
const SampleAuthContexts = require("../auth-context/auth-context.json");
const name = 'auth context display group';
const name2 = 'auth context display group 2';
const description2 = 'description 2';
const code = 'authContextCode1';
const code2 = 'authContextCode2';
const attributes = {parent: "root"};
const attributes2 = {parent: "janux"};

describe("Testing authContext groups service update methods", function () {

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
					return authContextService.insert(SampleAuthContexts[0]);
				})
				.then(function (insertedAuthContext) {
					insertedAuthContext1 = insertedAuthContext;
					return authContextService.insert(SampleAuthContexts[1]);

				})
				.then(function (insertedAuthContext) {
					insertedAuthContext2 = insertedAuthContext;
					done();
				});
		}, 50);
	});

	describe("When calling switchToNewGroup", function () {
		it("The method should move an authorization context from one group to another", function (done) {
			var group1 = new GroupImpl();
			group1.name = name;
			group1.code = code;
			group1.type = authContextGroupService.AUTHCONTEXT_GROUP_TYPE;
			group1.attributes = attributes;
			group1.values = [insertedAuthContext1];
			authContextGroupService.insert(group1)
				.then(function () {
					var group2 = new GroupImpl();
					group2.name = name2;
					group2.code = code2;
					group2.type = authContextGroupService.AUTHCONTEXT_GROUP_TYPE;
					group2.attributes = attributes;
					group2.values = [insertedAuthContext2];
					return authContextGroupService.insert(group2);
				})
				.then(function () {
					return authContextGroupService.switchToNewGroup(insertedAuthContext1,code2);
				})
				.then(function () {
					return authContextGroupService.findOne(group1.code);
				})
				.then(function (result) {
					// Group 1 should not have elements
					expect(result.values.length).eq(0);

					return authContextGroupService.findOne(code2);
				}).then(function (result) {
					// Group 2 should have two elements
					expect(result.name).eq(name2);
					expect(result.type).eq(authContextGroupService.AUTHCONTEXT_GROUP_TYPE);
					expect(result.values.length).eq(2);

					var element0 = _.find(result.values, function (v) {
						return v.id === insertedAuthContext1.id;
					});

					expect(element0.id).eq(insertedAuthContext1.id);
					expect(element0.name).eq(insertedAuthContext1.name);
					done();
				})
		});
	});

	describe("When calling update", function () {
		it("The method should update the groups", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.type = authContextGroupService.AUTHCONTEXT_GROUP_TYPE;
			group.attributes = attributes;
			group.values = [insertedAuthContext1];
			authContextGroupService.insert(group)
				.then(function (insertedGroup) {
					insertedGroup.name = name2;
					insertedGroup.description = description2;
					insertedGroup.values = [insertedAuthContext1, insertedAuthContext2];
					insertedGroup.attributes = attributes2;
					return authContextGroupService.update(insertedGroup);
				})
				.then(function (updatedGroup) {
					expect(updatedGroup.name).eq(name2);
					expect(updatedGroup.description).eq(description2);
					expect(updatedGroup.type).eq(authContextGroupService.AUTHCONTEXT_GROUP_TYPE);
					expect(updatedGroup.values.length).eq(2);

					var element1 = _.find(updatedGroup.values, function (v) {
						return v.id === insertedAuthContext2.id;
					});

					expect(element1.id).eq(insertedAuthContext2.id);
					expect(element1.name).eq(insertedAuthContext2.name);
					return authContextGroupService.findOne(updatedGroup.code);
				})
				.then(function (result) {
					expect(result.name).eq(name2);
					expect(result.description).eq(description2);
					expect(result.type).eq(authContextGroupService.AUTHCONTEXT_GROUP_TYPE);
					expect(result.values.length).eq(2);

					var element1 = _.find(result.values, function (v) {
						return v.id === insertedAuthContext2.id;
					});

					expect(element1.id).eq(insertedAuthContext2.id);
					expect(element1.name).eq(insertedAuthContext2.name);
					done();
				});
		});
	});
});

