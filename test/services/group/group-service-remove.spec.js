/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */

var chai = require("chai");
var _ = require("lodash");
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

const name = "a simple names group";
const type = "names";
const code = "code";
const attributes = { code: "code 1", parent: "root" };
const description = "a description";
const item1 = "name 1";
const item2 = "name 2";

const nameB = "a second list of names";
const codeB = "names2";
const descriptionB = "a description";
const attributesB = { code: "code 2", parent: "root" };
const item2B = "name 5";

describe("Testing group service remove methods", function() {
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
		}, 40);
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

	function getSampleData2() {
		var group2 = new Group();
		group2.type = type;
		group2.name = nameB;
		group2.code = codeB;
		group2.description = descriptionB;
		group2.attributes = attributesB;
		group2.values.push(item1);
		group2.values.push(item2);
		group2.values.push(item2B);
		return group2;
	}

	describe("When calling remove", function() {
		it("The method should delete the records", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function() {
					return groupService.remove(group.code);
				})
				.then(function() {
					return groupDao.count();
				})
				.then(function(result) {
					expect(result).eq(0);
					return groupContentDao.count();
				})
				.then(function(result) {
					expect(result).eq(0);
					return groupAttributeValueDao.count();
				})
				.then(function(result) {
					expect(result).eq(0);
					done();
				});
		});
	});

	describe("When calling remove with a code that does not exists in the database", function() {
		it("The method should return an error", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function() {
					return groupService.remove("invalidCode");
				})
				.then(
					function() {
						expect.fail("The method should not have deleted the record");
					},
					function(err) {
						expect(err).eq(GroupServiceValidator.NO_GROUP);
						done();
					}
				);
		});
	});

	describe("When calling remove with a null code", function() {
		it("The method should return an error", function(done) {
			var group = getSampleData();
			groupService
				.insert(group)
				.then(function() {
					return groupService.remove(null);
				})
				.then(
					function() {
						expect.fail("The method should not have deleted the record");
					},
					function(err) {
						expect(err).eq(GroupServiceValidator.NO_GROUP);
						done();
					}
				);
		});
	});

	describe("When calling removeItem", function() {
		it("The method should remove the item", function(done) {
			var group = getSampleData();
			expect(group.values.length).eq(2);
			var group2 = getSampleData2();
			groupService
				.insert(group)
				.then(function() {
					return groupService.insert(group2);
				})
				.then(function() {
					return groupService.removeItem(group.code, item1);
				})
				.then(function() {
					return groupContentDao.findAll();
				})
				.then(function(result) {
					expect(result.length).eq(4);
					expect(result[0].value).eq(item2);
					return groupService.findOne(group.code);
				})
				.then(function(resultQuery) {
					expect(resultQuery.values.length).eq(1);
					expect(resultQuery.values[0]).eq(item2);
					done();
				});
		});
	});

	describe("When calling removeItem with a null item", function() {
		it("The method should send an error", function(done) {
			var group = getSampleData();
			expect(group.values.length).eq(2);
			var group2 = getSampleData2();
			groupService
				.insert(group)
				.then(function() {
					return groupService.insert(group2);
				})
				.then(function() {
					return groupService.removeItem(group.code, null);
				})
				.then(
					function() {
						expect.fail("The method should have returned an error");
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

	describe("When calling removeItemByType with a item inside two groups", function() {
		it("The method should delete the item inside the two groups", function(done) {
			var group = getSampleData();
			expect(group.values.length).eq(2);
			var group2 = getSampleData2();
			groupService
				.insert(group)
				.then(function() {
					return groupService.insert(group2);
				})
				.then(function() {
					return groupService.removeItemByType(group.type, item1);
				})
				.then(function() {
					//Validating the item was removed inside the two groups.
					return groupService.findOne(group.code);
				})
				.then(function(resultQuery) {
					expect(resultQuery.values.length).eq(1);
					expect(resultQuery.values[0]).eq(item2);
					return groupService.findOne(group2.code);
				})
				.then(function(resultQuery2) {
					expect(resultQuery2.values.length).eq(2);

					var element0 = _.find(resultQuery2.values, function(o) {
						return o === item2;
					});

					var element1 = _.find(resultQuery2.values, function(o) {
						return o === item2B;
					});

					expect(element0).eq(item2);
					expect(element1).eq(item2B);
					done();
				});
		});
	});

	describe("When calling removeItemByType with a null item", function() {
		it("The method should return an error", function(done) {
			var group = getSampleData();
			expect(group.values.length).eq(2);
			var group2 = getSampleData2();
			groupService
				.insert(group)
				.then(function() {
					return groupService.insert(group2);
				})
				.then(function() {
					return groupService.removeItemByType(group.type, null);
				})
				.then(
					function() {
						expect.fail("The method should have returned an error");
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
});
