/**
 * Project janux-persist.js
 * Created by ernesto on 9/5/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var DaoUtil = require("../../daos/dao-util");
const SampleData = require("../../util/sample-data");
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const UserGroupService = require("../../../dist/index").UserGroupServiceImpl;
const GroupService = require("../../../dist/index").GroupServiceImpl;
const GroupImpl = require("../../../dist/index").GroupImpl;
const GroupServiceValidator = require("../../../dist/index").GroupServiceValidator;
const UserService = require("../../../dist/index").UserService;

//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
const name = 'name';
const code = 'code';
const name2 = 'name2';
const code2 = 'code2';
const attributes2 = {parent: "glarus", system: "true"};
const attributes = {parent: "root"};

describe("Testing user groups service remove methods", function () {

	var groupContentDao;
	var accountDao;
	var partyDao;
	var groupDao;
	var groupAttributeValueDao;
	var groupService;
	var userService;
	var userGroupService;

	var insertedUser1;
	var insertedUser2;
	var insertedUser3;
	beforeEach(function (done) {
		accountDao = DaoUtil.createAccountDao(dbEngine, path);
		partyDao = DaoUtil.createPartyDao(dbEngine, path);
		groupContentDao = DaoUtil.createGroupContentDao(dbEngine, path);
		groupDao = DaoUtil.createGroupDao(dbEngine, path);
		groupAttributeValueDao = DaoUtil.createGroupAttributesDao(dbEngine, path);
		groupService = new GroupService(groupDao, groupContentDao, groupAttributeValueDao);
		userService = UserService.createInstance(accountDao, partyDao);
		userGroupService = new UserGroupService(userService, groupService);
		setTimeout(function () {
			// Delete all records.
			accountDao.removeAll()
				.then(function () {
					return partyDao.removeAll();
				})
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
					// Insert users.
					var user1 = SampleData.createUser1();
					return userService.insert(user1);
				})
				.then(function (insertedUser) {
					var user2 = SampleData.createUser2();
					insertedUser1 = insertedUser;
					return userService.insert(user2);

				})
				.then(function (insertedUser) {
					var user3 = SampleData.createUser3();
					insertedUser2 = insertedUser;
					return userService.insert(user3);
				})
				.then(function (insertedUser) {
					insertedUser3 = insertedUser;
					var group = new GroupImpl();
					group.name = name;
					group.code = code;
					group.type = userGroupService.USERS_GROUP_TYPE;
					group.attributes = attributes;
					group.values = [insertedUser1, insertedUser2];
					return userGroupService.insert(group)
				})
				.then(function () {
					var group2 = new GroupImpl();
					group2.name = name2;
					group2.code = code2;
					group2.type = userGroupService.USERS_GROUP_TYPE;
					group2.attributes = attributes2;
					group2.values = [insertedUser3];
					return userGroupService.insert(group2);
				})
				.then(function () {
					done();
				})
		}, 50);

	});

	describe("When calling remove", function () {
		it("The method should remove the group", function (done) {
			userGroupService.remove(code2)
				.then(function () {
					return userGroupService.findOne(code2);
				})
				.then(function (result) {
					expect(result).to.be.null;
					return userGroupService.findOne(code);
				})
				.then(function (result) {
					expect(result.name).eq(name);
					expect(result.code).eq(code);
					expect(result.values.length).eq(2);
					done();
				});
		});
	});


	describe("When calling remove with invalid code", function () {
		it("The method should return an error", function (done) {
			userGroupService.remove("invalidCode")
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
			userGroupService.removeItem(code2, insertedUser3)
				.then(function () {
					return userGroupService.findOne(code2);
				})
				.then(function (result) {
					expect(result.values.length).eq(0);
					done();
				});
		});
	});
});
