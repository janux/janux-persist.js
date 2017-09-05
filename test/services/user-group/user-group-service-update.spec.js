/**
 * Project janux-persist.js
 * Created by ernesto on 9/5/17.
 */

var chai = require('chai');
var expect = chai.expect;
var config = require('config');
const DaoFactory = require("../../../dist/index").DaoFactory;
const SampleData = require("../../util/sample-data");
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const UserGroupService = require("../../../dist/index").UserGroupServiceImpl;
const GroupService = require("../../../dist/index").GroupServiceImpl;
const GroupImpl = require("../../../dist/index").GroupImpl;
const UserService = require("../../../dist/index").UserService;

//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
const name = 'name';
const name2 = 'name 2';
const description2 = 'description 2';
const code = 'code';
const attributes = {parent: "root"};
const attributes2 = {parent: "glarus"};

describe("Testing user groups service update methods", function () {

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
		accountDao = DaoFactory.createAccountDao(dbEngine, path);
		partyDao = DaoFactory.createPartyDao(dbEngine, path);
		groupContentDao = DaoFactory.createGroupContentDao(dbEngine, path);
		groupDao = DaoFactory.createGroupDao(dbEngine, path);
		groupAttributeValueDao = DaoFactory.createGroupAttributesDao(dbEngine, path);
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
					done();
				})
		}, 50);
	});


	describe("When calling update", function () {
		it("The method should update the groups", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.type = userGroupService.USERS_GROUP_TYPE;
			group.attributes = attributes;
			group.values = [insertedUser1, insertedUser3];
			userGroupService.insert(group)
				.then(function (insertedGroup) {
					insertedGroup.name = name2;
					insertedGroup.description = description2;
					insertedGroup.values = [insertedUser2];
					insertedGroup.attributes = attributes2;
					return userGroupService.update(insertedGroup);
				})
				.then(function (updatedGroup) {
					expect(updatedGroup.name).eq(name2);
					expect(updatedGroup.description).eq(description2);
					expect(updatedGroup.type).eq(userGroupService.USERS_GROUP_TYPE);
					expect(updatedGroup.values.length).eq(1);
					expect(updatedGroup.values[0].id).eq(insertedUser2.id);
					expect(updatedGroup.values[0].username).eq(insertedUser2.username);
					return userGroupService.findOne(updatedGroup.code);
				})
				.then(function (result) {
					expect(result.name).eq(name2);
					expect(result.description).eq(description2);
					expect(result.type).eq(userGroupService.USERS_GROUP_TYPE);
					expect(result.values.length).eq(1);
					expect(result.values[0].id).eq(insertedUser2.id);
					expect(result.values[0].username).eq(insertedUser2.username);
					done();
				});
		});
	});
});

