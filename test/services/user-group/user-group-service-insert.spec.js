/**
 * Project janux-persist
 * Created by ernesto on 2007/09/04.
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



describe("Testing user groups service insert methods", function () {

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

	describe("Whn calling insert with the correct values",function () {
		it("The method should insert the records",function (done) {
			var group = new GroupImpl();
			group.name = "group name";
			group.code = "code1";
			group.type = userGroupService.USERS_GROUP_TYPE;
			group.attributes = {};
			group.values = [insertedUser1, insertedUser2, insertedUser3];
			userGroupService.insert(group)
				.then(function (insertedGroup) {
					done();
				})
		})

	})
});
