var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var DaoUtil = require("../../daos/dao-util");
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const GroupService = require("../../../dist/index").GroupServiceImpl;
const Group = require("../../../dist/index").GroupImpl;
const GroupServiceValidator = require("../../../dist/index").GroupServiceValidator;
//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path =
	dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;

const name = "a name";
const type = "type";
const code = "a code";
const attributes = { code: "code 1" };
const description = "a description";
const item1 = "item 1";
const item2 = "item 2";

const updatedName = "a name 2";
const updatedDescription = "a description 2";
const updatedAttributes = { code: "code 2" };
const item3 = "item 3";

describe("Testing group service update methods", function() {
	var groupContentDao;
	var groupAttributeValueDao;
	var groupDao;
	var groupService;

	beforeEach("Cleaning data and define daos", function(done) {
		groupContentDao = DaoUtil.createGroupContentDao(dbEngine, path);
		groupDao = DaoUtil.createGroupDao(dbEngine, path);
		groupAttributeValueDao = DaoUtil.createGroupAttributesDao(dbEngine, path);
		groupService = new GroupService(groupDao, groupContentDao, groupAttributeValueDao);
		setTimeout(function() {
			groupContentDao
				.removeAll()
				.then(function() {
					return groupDao.removeAll();
				})
				.then(function() {
					return groupAttributeValueDao.removeAll();
				})
				.then(function() {
					done();
				});
		}, 50);
	});

	function getSampleData() {
		var group = new Group();
		group.type = type;
		group.name = name;
		group.code = code;
		group.description = description;
		group.attributes = attributes;
		group.values.push(item1);
		group.values.push(item2);
		return group;
	}

	describe("When calling update", function() {
		it("The method should update the group", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function(result) {
					group.name = updatedName;
					group.description = updatedDescription;
					group.attributes = updatedAttributes;
					group.values.push(item3);
					return groupService.update(group);
				})
				.then(function(updatedGroup) {
					expect(updatedGroup.name).eq(updatedName);
					expect(updatedGroup.description).eq(updatedDescription);
					expect(updatedGroup.attributes).to.deep.equals(updatedAttributes);
					expect(updatedGroup.values).to.deep.equals([item1, item2, item3]);
					done();
				});
		});
	});

	describe("When calling update with incorrect values", function() {
		it("The method should send an error", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function(result) {
					group.name = updatedName;
					group.description = updatedDescription;
					group.attributes = { code: "   ", parent: "  " };
					group.values.push(item3);
					return groupService.update(group);
				})
				.then(
					function(updatedGroup) {
						expect.fail("The method should not have updated the group");
					},
					function(err) {
						expect(err.length).eq(2);
						expect(err[0].attribute).eq(GroupServiceValidator.ATTRIBUTE);
						expect(err[1].attribute).eq(GroupServiceValidator.ATTRIBUTE);
						expect(err[0].message).eq(GroupServiceValidator.ATTRIBUTE_VALUE_EMPTY);
						expect(err[1].message).eq(GroupServiceValidator.ATTRIBUTE_VALUE_EMPTY);
						done();
					}
				);
		});
	});

	describe("When calling update with a code that does not exists in the database", function() {
		it("The method should send an error", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function(result) {
					group.code = "invalidCode";
					group.name = updatedName;
					group.description = updatedDescription;
					group.values.push(item3);
					return groupService.update(group);
				})
				.then(
					function(updatedGroup) {
						expect.fail("The method should not have updated the group");
					},
					function(err) {
						expect(err).eq(GroupServiceValidator.NO_GROUP);
						done();
					}
				);
		});
	});
});
