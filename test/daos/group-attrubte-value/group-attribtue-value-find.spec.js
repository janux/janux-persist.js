/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */


var chai = require('chai');
var expect = chai.expect;
var config = require('config');

var serverAppContext = config.get("serverAppContext");
var DaoFactory = require("../../../dist/index").DaoFactory;
var GroupAttributeValueEntity = require("../../../dist/index").GroupAttributeValueEntity;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

const idGroup1 = "100000";
const idGroup2 = "100001";
const key1 = "code";
const value1a = "value 1";
const value1b = "value 2";

const key2 = "parent";
const value2a = "root";


describe("Testing group attribute-value dao find methods", function () {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
		var dao;
		var insertedRecord1;
		var insertedRecord2;
		var insertedRecord3;
		var insertedRecord4;
		beforeEach(function (done) {
			var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
			dao = DaoFactory.createGroupAttributesDao(dbEngine, path);
			dao.removeAll()
				.then(function () {
					var keyValue1 = new GroupAttributeValueEntity();
					keyValue1.idGroup = idGroup1;
					keyValue1.key = key1;
					keyValue1.value = value1a;

					var keyValue2 = new GroupAttributeValueEntity();
					keyValue2.idGroup = idGroup1;
					keyValue2.key = key2;
					keyValue2.value = value2a;

					var keyValue3 = new GroupAttributeValueEntity();
					keyValue3.idGroup = idGroup2;
					keyValue3.key = key1;
					keyValue3.value = value1b;

					var keyValue4 = new GroupAttributeValueEntity();
					keyValue4.idGroup = idGroup2;
					keyValue4.key = key2;
					keyValue4.value = value2a;

					return dao.insertMany([keyValue1, keyValue2, keyValue3, keyValue4])

				})
				.then(function (insertedRecords) {
					insertedRecord1 = insertedRecords[0];
					insertedRecord2 = insertedRecords[1];
					insertedRecord3 = insertedRecords[2];
					insertedRecord4 = insertedRecords[3];
					done();
				})
		});


		describe("When calling findByIdGroupAndKey ", function () {
			it("The method should return one record", function (done) {
				dao.findByIdGroupAndKey(idGroup1, key1)
					.then(function (resultQuery) {
						expect(resultQuery.length).eq(1);
						done();
					});
			});
		});

		describe("When calling findByIdGroupsAndKeyValuesMatch with a empty keyVales", function () {
			it("The method should return all records", function (done) {
				dao.findByIdGroupsAndKeyValuesMatch([idGroup1, idGroup2], {})
					.then(function (value) {
						expect(value.length).eq(4);
						done();
					});
			});
		});

		describe("When calling findByIdGroupsAndKeyValuesMatch with a null keyVales", function () {
			it("The method should return all records", function (done) {
				dao.findByIdGroupsAndKeyValuesMatch([idGroup1, idGroup2], null)
					.then(function (value) {
						expect(value.length).eq(4);
						done();
					});
			});
		});


		describe("When calling findByIdGroupsAndKeyValuesMatch with a shared key-value", function () {
			it("The method should return 2 records", function (done) {
				dao.findByIdGroupsAndKeyValuesMatch([idGroup1, idGroup2], {parent: value2a})
					.then(function (value) {
						expect(value.length).eq(2);
						done();
					});
			});
		});

		describe("When calling findByIdGroupsAndKeyValuesMatch with a shared key-value and a not shared key-value", function () {
			it("The method should return 3 records", function (done) {
				dao.findByIdGroupsAndKeyValuesMatch([idGroup1, idGroup2], {parent: value2a, code: value1a})
					.then(function (value) {
						expect(value.length).eq(3);
						done();
					});
			});
		});

	});
});
