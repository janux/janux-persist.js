/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var config = require("config");

var DaoUtil = require("../dao-util");
var GroupEntity = require("../../../dist/index").GroupEntity;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const groupName1 = "Group 1";
const groupName2 = "Group 1";
const groupName3 = "Group 3";
const groupDescription1 = "Description 1";
const groupDescription2 = "Description 2";
const groupDescription3 = "Description 3";
const type = "a type";
const type2 = "a type2";
const code = "code";
const code2 = "code 2";
const code3 = "code 3";

describe("Testing group dao find methods", function() {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function(dbEngine) {
		var groupDao;
		var insertedRecord1;
		var insertedRecord2;
		beforeEach(function(done) {
			var path =
				dbEngine === DataSourceHandler.LOKIJS
					? serverAppContext.db.lokiJsDBPath
					: serverAppContext.db.mongoConnUrl;
			groupDao = DaoUtil.createGroupDao(dbEngine, path);
			groupDao
				.removeAll()
				.then(function() {
					var group1 = new GroupEntity();
					group1.name = groupName1;
					group1.description = groupDescription1;
					group1.code = code;
					group1.type = type;

					var group2 = new GroupEntity();
					group2.name = groupName2;
					group2.description = groupDescription2;
					group2.code = code2;
					group2.type = type;

					var group3 = new GroupEntity();
					group3.name = groupName3;
					group3.description = groupDescription3;
					group3.code = code3;
					group3.type = type2;

					return groupDao.insertMany([group1, group2, group3]);
				})
				.then(function(result) {
					insertedRecord1 = result[0];
					insertedRecord2 = result[1];
					done();
				})
				.catch(function(err) {
					assert.fail("Error", err);
				});
		});

		describe("When calling findByType", function() {
			it("The method should return two records", function(done) {
				groupDao.findByType(type).then(function(result) {
					expect(result.length).eq(2);
					done();
				});
			});
		});
	});
});
