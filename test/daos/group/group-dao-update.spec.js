/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');


var DaoFactory = require("../../../dist/index").DaoFactory;
var GroupEntity = require("../../../dist/index").GroupEntity;
var GroupValidator = require("../../../dist/index").GroupValidator;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const groupName1 = "Group 1";
const groupName2 = "Group 1";
const groupDescription1 = "Description 1";
const groupDescription2 = "Description 2";
const code = "code";
const code2 = "code2";

const groupNameNewValue = "Group new value";
const groupDescriptionNewValue = "Description new value";
const type = "a type";

describe("Testing group dao update methods", function () {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
		var groupDao;
		var insertedRecord1;
		var insertedRecord2;
		beforeEach(function (done) {
			var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
			groupDao = DaoFactory.createGroupDao(dbEngine, path);
			groupDao.removeAll()
				.then(function () {
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

					return groupDao.insertMany([group1, group2])
				})
				.then(function (result) {
					insertedRecord1 = result[0];
					insertedRecord2 = result[1];
					done();
				})
				.catch(function (err) {
					assert.fail("Error", err);
				})
		});


		describe("When updating the record", function () {
			it("The method should not return any error", function (done) {
				var id = insertedRecord1.id;
				insertedRecord1.name = groupNameNewValue;
				insertedRecord1.description = groupDescriptionNewValue;
				groupDao.update(insertedRecord1)
					.then(function (result) {
						expect(result.id).eq(id);
						expect(result.name).eq(groupNameNewValue);
						expect(result.description).eq(groupDescriptionNewValue);
						return groupDao.findOne(id);
					})
					.then(function (result) {
						expect(result.id).eq(id);
						expect(result.name).eq(groupNameNewValue);
						expect(result.description).eq(groupDescriptionNewValue);
						done();
					});
			})
		});

		describe("When updating a group with a duplicated code", function () {
			it("The method should return an error", function (done) {
				insertedRecord1.code = code2;
				groupDao.update(insertedRecord1)
					.then(function () {
						expect.fail("The method should not have updated the record");
					}, function (err) {
						expect(err.length).eq(1);
						expect(err[0].attribute).eq(GroupValidator.CODE);
						expect(err[0].message).eq(GroupValidator.CODE_DUPLICATE);
						done();
					})
			});
		});

		describe("When updating the record with incorrect values", function () {
			it("The method should return an error", function (done) {
				insertedRecord1.name = groupNameNewValue;
				insertedRecord1.description = groupDescriptionNewValue;
				insertedRecord1.type = "  ";
				groupDao.update(insertedRecord1)
					.then(function () {
						expect.fail("The method should not have updated the record");
					})
					.catch(function (err) {
						expect(err.length).eq(1);
						expect(err[0].attribute).eq(GroupValidator.TYPE);
						expect(err[0].message).eq(GroupValidator.TYPE_EMPTY);
						done();
					})
			});
		});
	});
});
