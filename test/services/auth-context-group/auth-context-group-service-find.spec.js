/**
 * Project janux-persist
 * Created by alejandro janux on 2017-09-26
 */


var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
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

// Test values
const SampleAuthContexts = require("../auth-context/auth-context.json");
const name = 'auth context display group';
const name2 = 'auth context display group 2';
const code = 'code';
const code2 = 'code2';
const attributes = {parent: "root", system: "true"};
const attributes2 = {parent: "janux", system: "true"};


describe("Testing user group service find methods", function () {
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

	describe("When calling find one", function () {
		it("The method must return the authContexts group", function (done) {
			authContextGroupService.findOne(code2)
				.then(function (result) {
					expect(result.name).eq(name2);
					expect(result.code).eq(code2);
					expect(result.attributes).to.deep.equal(attributes2);
					expect(result.values.length).eq(1);
					expect(result.values[0].id).eq(insertedAuthContext2.id);
					return authContextGroupService.findOne(code);
				})
				.then(function (result) {
					expect(result.name).eq(name);
					expect(result.code).eq(code);
					expect(result.attributes).to.deep.equal(attributes);
					expect(result.values.length).eq(1);
					var value1 = _.find(result.values, function (o) {
						return o.id === insertedAuthContext1.id;
					});
					expect(value1.id).eq(insertedAuthContext1.id);
					expect(value1.name).eq(insertedAuthContext1.name);
					done();
				});
		});
	});

	describe("When calling findAll", function () {
		it("The method should return all groups", function (done) {
			authContextGroupService.findAll()
				.then(function (result) {
					expect(result.length).eq(2);

					var element0 = _.find(result, function (o) {
						return o.code === code;
					});

					var element1 = _.find(result, function (o) {
						return o.code === code2;
					});

					expect(element0.code).eq(code);
					expect(element0.values.length).eq(1);
					expect(element0.values[0].id).eq(insertedAuthContext1.id);
					expect(element0.values[0].name).eq(insertedAuthContext1.name);
					expect(element0.values[0].typeName).eq(insertedAuthContext1.typeName);
					expect(element1.code).eq(code2);
					expect(element1.values.length).eq(1);
					expect(element1.values[0].id).eq(insertedAuthContext2.id);
					expect(element1.values[0].name).eq(insertedAuthContext2.name);
					expect(element1.values[0].typeName).eq(insertedAuthContext2.typeName);
					done();
				})
		});
	});

	describe("When calling findByFilter with filter with an attribute unique to one group", function () {
		it("The method should return one group", function (done) {
			authContextGroupService.findByFilter({parent: "root"})
				.then(function (result) {
					expect(result.length).eq(1);
					expect(result[0].code).eq(code);
					expect(result[0].name).eq(name);
					expect(result[0].values.length).eq(1);
					done();
				})
		});
	});

	describe("When calling findByFilter with filter with an attribute shared to the two groups", function () {
		it("The method should return two groups", function (done) {
			authContextGroupService.findByFilter({system: "true"})
				.then(function (result) {
					expect(result.length).eq(2);

					var element0 = _.find(result, function (o) {
						return o.code === code;
					});

					var element1 = _.find(result, function (o) {
						return o.code === code2;
					});

					expect(element0.code).eq(code);
					expect(element0.name).eq(name);
					expect(element0.values.length).eq(1);

					expect(element1.code).eq(code2);
					expect(element1.name).eq(name2);
					expect(element1.values.length).eq(1);
					done();
				})
		});
	});
});
