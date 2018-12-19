/**
 * Project janux-persist
 * Created by ernesto on 2007/09/04.
 */

var chai = require("chai");
var _ = require("lodash");
var expect = chai.expect;
var config = require("config");
var DaoUtil = require("../../daos/dao-util");
const SampleData = require("../../util/sample-data");
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const UserGroupService = require("../../../dist/index").UserGroupServiceImpl;
const GroupService = require("../../../dist/index").GroupServiceImpl;
const GroupImpl = require("../../../dist/index").GroupImpl;
const UserService = require("../../../dist/index").UserService;
const PartyServiceImpl = require("../../../dist/index").PartyServiceImpl;

//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path =
	dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
const name = "name";
const name2 = "name2";
const code = "code";
const code2 = "code2";
const attributes = { parent: "root", system: "true" };
const attributes2 = { parent: "glarus", system: "true" };

describe("Testing user group service find methods", function() {
	var groupContentDao;
	var accountDao;
	var partyDao;
	var staffDao;
	var groupDao;
	var groupAttributeValueDao;
	var groupService;
	var userService;
	var partyService;
	var userGroupService;

	var insertedUser1;
	var insertedUser2;
	var insertedUser3;

	beforeEach(function(done) {
		accountDao = DaoUtil.createAccountDao(dbEngine, path);
		partyDao = DaoUtil.createPartyDao(dbEngine, path);
		groupContentDao = DaoUtil.createGroupContentDao(dbEngine, path);
		groupDao = DaoUtil.createGroupDao(dbEngine, path);
		groupAttributeValueDao = DaoUtil.createGroupAttributesDao(dbEngine, path);
		groupService = new GroupService(groupDao, groupContentDao, groupAttributeValueDao);
		staffDao = DaoUtil.createStaffDataDao(dbEngine, path);
		partyService = new PartyServiceImpl(partyDao, staffDao);
		userService = UserService.createInstance(accountDao, partyService);
		userGroupService = new UserGroupService(userService, groupService);
		setTimeout(function() {
			// Delete all records.
			accountDao
				.removeAll()
				.then(function() {
					return partyDao.removeAll();
				})
				.then(function() {
					return groupAttributeValueDao.removeAll();
				})
				.then(function() {
					return groupContentDao.removeAll();
				})
				.then(function() {
					return groupDao.removeAll();
				})
				.then(function() {
					return staffDao.removeAll();
				})
				.then(function() {
					// Insert users.
					var user1 = SampleData.createUser1();
					return userService.insert(user1);
				})
				.then(function(insertedUser) {
					var user2 = SampleData.createUser2();
					insertedUser1 = insertedUser;
					return userService.insert(user2);
				})
				.then(function(insertedUser) {
					var user3 = SampleData.createUser3();
					insertedUser2 = insertedUser;
					return userService.insert(user3);
				})
				.then(function(insertedUser) {
					insertedUser3 = insertedUser;
					var group = new GroupImpl();
					group.name = name;
					group.code = code;
					group.type = userGroupService.USERS_GROUP_TYPE;
					group.attributes = attributes;
					group.values = [insertedUser1, insertedUser2];
					return userGroupService.insert(group);
				})
				.then(function() {
					var group2 = new GroupImpl();
					group2.name = name2;
					group2.code = code2;
					group2.type = userGroupService.USERS_GROUP_TYPE;
					group2.attributes = attributes2;
					group2.values = [insertedUser3];
					return userGroupService.insert(group2);
				})
				.then(function() {
					done();
				});
		}, 50);
	});

	describe("When calling find one", function() {
		it("The method must return the users group", function(done) {
			userGroupService
				.findOne(code2)
				.then(function(result) {
					expect(result.name).eq(name2);
					expect(result.code).eq(code2);
					expect(result.attributes).to.deep.equal(attributes2);
					expect(result.values.length).eq(1);
					expect(result.values[0].id).eq(insertedUser3.id);
					expect(result.values[0].username).eq(insertedUser3.username);
					return userGroupService.findOne(code);
				})
				.then(function(result) {
					expect(result.name).eq(name);
					expect(result.code).eq(code);
					expect(result.attributes).to.deep.equal(attributes);
					expect(result.values.length).eq(2);
					var value1 = _.find(result.values, function(o) {
						return o.id === insertedUser1.id;
					});
					var value2 = _.find(result.values, function(o) {
						return o.id === insertedUser2.id;
					});
					expect(value1.id).eq(insertedUser1.id);
					expect(value1.username).eq(insertedUser1.username);
					expect(value1.password).eq(insertedUser1.password);
					expect(value2.id).eq(insertedUser2.id);
					expect(value2.username).eq(insertedUser2.username);
					expect(value2.password).eq(insertedUser2.password);
					done();
				});
		});
	});

	describe("When calling findAll", function() {
		it("The method should return all groups", function(done) {
			userGroupService.findAll().then(function(result) {
				expect(result.length).eq(2);

				var element0 = _.find(result, function(o) {
					return o.code === code;
				});

				var element1 = _.find(result, function(o) {
					return o.code === code2;
				});

				expect(element0.code).eq(code);
				expect(element0.values.length).eq(2);

				var subElement0 = _.find(element0.values, function(o) {
					return o.id === insertedUser1.id;
				});

				expect(subElement0.id).eq(insertedUser1.id);
				expect(subElement0.username).eq(insertedUser1.username);
				expect(subElement0.password).eq(insertedUser1.password);
				expect(subElement0.typeName).eq(insertedUser1.typeName);

				var subElement1 = _.find(element0.values, function(o) {
					return o.id === insertedUser2.id;
				});

				expect(subElement1.id).eq(insertedUser2.id);
				expect(subElement1.username).eq(insertedUser2.username);
				expect(subElement1.password).eq(insertedUser2.password);
				expect(subElement1.typeName).eq(insertedUser2.typeName);

				expect(element1.code).eq(code2);
				expect(element1.values.length).eq(1);
				expect(element1.values[0].id).eq(insertedUser3.id);
				expect(element1.values[0].username).eq(insertedUser3.username);
				expect(element1.values[0].typeName).eq(insertedUser3.typeName);
				done();
			});
		});
	});

	describe("When calling findByFilter with filter with an attribute unique to one group", function() {
		it("The method should return one group", function(done) {
			userGroupService.findByFilter({ parent: "root" }).then(function(result) {
				expect(result.length).eq(1);
				expect(result[0].code).eq(code);
				expect(result[0].name).eq(name);
				expect(result[0].values.length).eq(2);
				done();
			});
		});
	});

	describe("When calling findByFilter with filter with an attribute shared to the two groups", function() {
		it("The method should return two groups", function(done) {
			userGroupService.findByFilter({ system: "true" }).then(function(result) {
				expect(result.length).eq(2);

				var result0 = _.find(result, function(o) {
					return o.code === code;
				});

				expect(result0.code).eq(code);
				expect(result0.name).eq(name);
				expect(result0.values.length).eq(2);

				var result1 = _.find(result, function(o) {
					return o.code === code2;
				});

				expect(result1.code).eq(code2);
				expect(result1.name).eq(name2);
				expect(result1.values.length).eq(1);
				done();
			});
		});
	});
});
