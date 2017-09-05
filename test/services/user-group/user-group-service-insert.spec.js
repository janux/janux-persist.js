/**
 * Project janux-persist
 * Created by ernesto on 2007/09/04.
 */

var chai = require('chai');
var _ = require('lodash');
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
const code = 'code';
const attributes = {parent: "root"};

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

	describe("When calling insert with the correct values", function () {
		it("The method should insert the records", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.type = userGroupService.USERS_GROUP_TYPE;
			group.attributes = attributes;
			group.values = [insertedUser1, insertedUser2, insertedUser3];
			userGroupService.insert(group)
				.then(function (insertedGroup) {
					expect(insertedGroup.name).eq(name);
					expect(insertedGroup.code).eq(code);
					expect(insertedGroup.attributes).eq(attributes);
					expect(insertedGroup.values.length).eq(3);
					expect(insertedGroup.values).to.deep.equal([insertedUser1, insertedUser2, insertedUser3]);
					return groupContentDao.findAll();
				})
				.then(function (resultQuery) {
					expect(resultQuery.length).eq(3);
					expect(resultQuery[0].value).eq(insertedUser1.id);
					expect(resultQuery[1].value).eq(insertedUser2.id);
					expect(resultQuery[2].value).eq(insertedUser3.id);
					expect(resultQuery[0].idGroup).eq(resultQuery[1].idGroup);
					expect(resultQuery[0].idGroup).eq(resultQuery[2].idGroup);
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


	describe("When calling insert with users not associated to the database", function () {
		it("The method should return an error", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.type = userGroupService.USERS_GROUP_TYPE;
			group.attributes = attributes;
			insertedUser3.id = "invalidId";
			group.values = [insertedUser1, insertedUser2, insertedUser3];
			userGroupService.insert(group)
				.then(function (result) {
					expect.fail("The method should not have inserted the record");
				}, function (err) {
					expect(err).eq(userGroupService.NO_USERS);
					done();
				})
		});
	});


	describe("When calling addItem", function () {
		it("The method should add an item", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.type = userGroupService.USERS_GROUP_TYPE;
			group.attributes = attributes;
			group.values = [insertedUser1];
			userGroupService.insert(group)
				.then(function () {
					return userGroupService.addItem(code, insertedUser2);
				})
				.then(function () {
					return userGroupService.findOne(code);
				})
				.then(function (updatedGroup) {
					expect(updatedGroup.name).eq(name);
					expect(updatedGroup.values.length).eq(2);
					const user1 = _.find([insertedUser1, insertedUser2], function (o) {
						return o.id === updatedGroup.values[0].id;
					});
					const user2 = _.find([insertedUser1, insertedUser2], function (o) {
						return o.id === updatedGroup.values[1].id;
					});
					expect(user1).not.to.be.undefined;
					expect(user2).not.to.be.undefined;
					done();
				});
		});
	});


	describe("When calling addItem with an user that does not exists in the database", function () {
		it("The method should return an error", function (done) {
			var group = new GroupImpl();
			group.name = name;
			group.code = code;
			group.type = userGroupService.USERS_GROUP_TYPE;
			group.attributes = attributes;
			group.values = [insertedUser1];
			userGroupService.insert(group)
				.then(function () {
					insertedUser2.id = 'invalidId';
					return userGroupService.addItem(code, insertedUser2);
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
			group.type = userGroupService.USERS_GROUP_TYPE;
			group.attributes = attributes;
			group.values = [insertedUser1];
			userGroupService.insert(group)
				.then(function () {
					return userGroupService.addItem(code, undefined);
				})
				.then(function () {
					expect.fail("The method should not have inserted the record");
				}, function (err) {
					done();
				});
		})
	});
});
