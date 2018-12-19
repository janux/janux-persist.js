/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */

var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var DaoUtil = require("../../daos/dao-util");
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const GroupServiceValidator = require("../../../dist/index").GroupServiceValidator;
const GroupContentValidator = require("../../../dist/index").GroupContentValidator;
const GroupService = require("../../../dist/index").GroupServiceImpl;
const Group = require("../../../dist/index").GroupImpl;
//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path =
	dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;

const name = "a simple names group";
const code = "code1";
const type = "names";
const attributes = { code: "code 1" };
const description = "a description";
const item1 = "name 1";
const item2 = "name 2";
const item3 = "name 3";

describe("Testing group service insert methods", function() {
	var groupContentDao;
	var groupAttributeValueDao;
	var groupDao;
	var groupService;

	beforeEach(function(done) {
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

	describe("When calling insert with correct values", function() {
		it("The method should insert the record", function(done) {
			var group = getSampleData();
			var idReference;
			groupService
				.insert(group)
				.then(function(result) {
					expect(result.name).eq(name);
					expect(result.description).eq(description);
					expect(result.code).eq(code);
					expect(result.type).eq(type);
					expect(result.attributes).eq(attributes);
					expect(result.values.length).eq(2);
					return groupDao.findAll();
				})
				.then(function(result) {
					expect(result.length).eq(1);
					expect(result[0].id).not.to.be.undefined;
					expect(result[0].name).eq(name);
					expect(result[0].description).eq(description);
					expect(result[0].code).eq(code);
					expect(result[0].type).eq(type);
					idReference = result[0].id;
					return groupContentDao.findAll();
				})
				.then(function(result) {
					expect(result.length).eq(2);
					expect(result[0].idGroup).eq(idReference);
					expect(result[0].value).eq(item1);
					expect(result[1].idGroup).eq(idReference);
					expect(result[1].value).eq(item2);
					return groupAttributeValueDao.findAll();
				})
				.then(function(result) {
					const keys = Object.keys(attributes);
					expect(result.length).eq(keys.length);
					expect(result[0].key).eq(keys[0]);
					done();
				});
		});
	});

	describe("When inserting a group with incorrect values", function() {
		it("The method should return an error", function(done) {
			var group = getSampleData();
			group.attributes = { code: "   ", parent: "  " };
			groupService.insert(group).then(
				function(result) {
					expect.fail("The method should not have inserted the group");
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

	describe("When inserting with a duplicated code", function() {
		it("The method should return an error", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function() {
					var group2 = getSampleData();
					return groupService.insert(group2);
				})
				.then(function() {
					expect.fail("The method should not have inserted the group");
					done();
				})
				.catch(function(err) {
					expect(err).eq(GroupServiceValidator.DUPLICATED_GROUP);
					done();
				});
		});
	});

	describe("When calling the method add item", function() {
		it("The method should insert the new item", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function() {
					return groupService.addItem(code, item3);
				})
				.then(function() {
					return groupContentDao.findAll();
				})
				.then(function(result) {
					expect(result.length).eq(3);
					done();
				});
		});
	});

	describe("When calling addItem with a undefined item", function() {
		it("the method should send an error", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function() {
					return groupService.addItem(code, undefined);
				})
				.then(
					function() {
						expect.fail("The method should not have inserted the item");
					},
					function(err) {
						expect(err.length).eq(1);
						expect(err[0].attribute).eq(GroupServiceValidator.ITEM);
						expect(err[0].message).eq(GroupServiceValidator.ITEM_EMPTY);
						done();
					}
				);
		});
	});

	describe("When calling the method add item with an existing item", function() {
		it("The method should return a reject", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function() {
					return groupService.addItem(code, item2);
				})
				.then(
					function() {
						expect.fail("The method should not have inserted the item");
					},
					function(err) {
						expect(err.length).eq(1);
						expect(err[0].attribute).eq(GroupContentValidator.OBJECT_GROUP);
						expect(err[0].message).eq(GroupContentValidator.OBJECT_GROUP_DUPLICATED);
						return groupContentDao.findAll();
					}
				)
				.then(function(result) {
					// Make sure any record is not inserted.
					expect(result.length).eq(2);
					done();
				});
		});
	});

	describe("When calling addItem with null code", function() {
		it("The method should return an error", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function() {
					return groupService.addItem(null, item3);
				})
				.then(
					function() {
						expect.fail("The method should not have inserted the item");
					},
					function(err) {
						expect(err).eq(GroupServiceValidator.NO_GROUP);
						return groupContentDao.findAll();
					}
				)
				.then(function(result) {
					// Make sure any record is not inserted.
					expect(result.length).eq(2);
					done();
				});
		});
	});
});
