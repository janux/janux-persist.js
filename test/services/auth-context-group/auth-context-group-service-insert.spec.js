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
const code = 'code';
const attributes = {parent: "root"};

describe("Testing authContext groups service insert methods", function () {

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
					done();
				});
		}, 50);

	});

	describe("When calling insert with the correct values", function () {
		it("The method should insert the records", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.attributes = attributes;
			group.values = [insertedAuthContext1, insertedAuthContext2];
			authContextGroupService.insert(group)
				.then(function (insertedGroup) {
					expect(insertedGroup.name).eq(name);
					expect(insertedGroup.code).eq(code);
					expect(insertedGroup.type).eq(authContextGroupService.AUTHCONTEXT_GROUP_TYPE);
					expect(insertedGroup.attributes).eq(attributes);
					expect(insertedGroup.values.length).eq(2);
					expect(insertedGroup.values).to.deep.equal([insertedAuthContext1, insertedAuthContext2]);
					return groupContentDao.findAll();
				})
				.then(function (resultQuery) {
					expect(resultQuery.length).eq(2);
					expect(resultQuery[0].value).eq(insertedAuthContext1.id);
					expect(resultQuery[1].value).eq(insertedAuthContext2.id);
					expect(resultQuery[0].idGroup).eq(resultQuery[1].idGroup);
					const idGroup = resultQuery[0].idGroup;
					return groupDao.findOne(idGroup);
				})
				.then(function (resultQuery) {
					expect(resultQuery.name).eq(name);
					expect(resultQuery.code).eq(code);
					return groupAttributeValueDao.findAll();
				})
				.then(function (resultQuery) {
					expect(resultQuery.length).eq(1);
					expect(resultQuery[0].key).eq('parent');
					expect(resultQuery[0].value).eq('root');
					done();
				});
		});
	});


	describe("When calling insert with authContexts not associated to the database", function () {
		it("The method should return an error", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.attributes = attributes;
			insertedAuthContext2.id = "invalidId";
			group.values = [insertedAuthContext1, insertedAuthContext2];
			authContextGroupService.insert(group)
				.then(function (result) {
					expect.fail("The method should not have inserted the record");
				}, function (err) {
					expect(err).eq(authContextGroupService.NO_AUTHCONTEXTS);
					done();
				})
		});
	});


	describe("When calling addItem", function () {
		it("The method should add an item", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.attributes = attributes;
			group.values = [insertedAuthContext1];
			authContextGroupService.insert(group)
				.then(function () {
					return authContextGroupService.addItem(code, insertedAuthContext2);
				})
				.then(function () {
					return authContextGroupService.findOne(code);
				})
				.then(function (updatedGroup) {
					expect(updatedGroup.name).eq(name);
					expect(updatedGroup.values.length).eq(2);
					const authContext1 = _.find([insertedAuthContext1, insertedAuthContext2], function (o) {
						return o.id === updatedGroup.values[0].id;
					});
					const authContext2 = _.find([insertedAuthContext1, insertedAuthContext2], function (o) {
						return o.id === updatedGroup.values[1].id;
					});
					expect(authContext1).not.to.be.undefined;
					expect(authContext2).not.to.be.undefined;
					done();
				});
		});
	});


	describe("When calling addItem with an authContext that does not exists in the database", function () {
		it("The method should return an error", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.attributes = attributes;
			group.values = [insertedAuthContext1];
			authContextGroupService.insert(group)
				.then(function () {
					insertedAuthContext2.id = 'invalidId';
					return authContextGroupService.addItem(code, insertedAuthContext2);
				})
				.then(function () {
					expect.fail("The method should not have inserted the record");
				}, function (err) {
					done();
				});
		});
	});

	describe("When calling addItem with undefined id", function () {
		it("The method should return an error", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.attributes = attributes;
			group.values = [insertedAuthContext1];
			authContextGroupService.insert(group)
				.then(function () {
					return authContextGroupService.addItem(code, undefined);
				})
				.then(function () {
					expect.fail("The method should not have inserted the record");
				}, function (err) {
					done();
				});
		})
	});
});
