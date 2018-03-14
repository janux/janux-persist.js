/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */


var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');

var DaoUtil = require("../dao-util");
var GroupValueEntity = require("../../../dist/index").GroupContentEntity;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");
const idGroup = "idGroup";
const objectGroup = "value";
const idGroup2 = "idGroup2";
const objectGroup2 = "objectGroup2";

const name3 = "name3";
const idPerson3 = "12345";
const idGroup3 = "idGroup3";
const objectGroup3 = {
	name: name3,
	idPerson: idPerson3
};

const name4 = "name4";
const idPerson4 = "67890";
const idGroup4 = idGroup3;
const objectGroup4 = {
	name: name4,
	idPerson: idPerson4
};


describe("Testing group value dao find methods", function () {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
		var groupValueDao;
		var insertedRecord1;
		var insertedRecord2;
		var insertedRecord3;
		var insertedRecord4;
		beforeEach(function (done) {
			var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
			groupValueDao = DaoUtil.createGroupContentDao(dbEngine, path);
			groupValueDao.removeAll()
				.then(function () {
					var groupValue = new GroupValueEntity();
					groupValue.idGroup = idGroup;
					groupValue.value = objectGroup;
					var groupValue2 = new GroupValueEntity();
					groupValue2.idGroup = idGroup2;
					groupValue2.value = objectGroup2;
					var groupValue3 = new GroupValueEntity();
					groupValue3.idGroup = idGroup3;
					groupValue3.value = objectGroup3;
					var groupValue4 = new GroupValueEntity();
					groupValue4.idGroup = idGroup4;
					groupValue4.value = objectGroup4;


					groupValueDao.insertMany([groupValue, groupValue2, groupValue3, groupValue4])
						.then(function (result) {
							insertedRecord1 = result[0];
							insertedRecord2 = result[1];
							insertedRecord3 = result[2];
							insertedRecord4 = result[3];
							done();
						});
				})
				.catch(function (err) {
					assert.fail("Error", err);
				})
		});

		describe("When calling findByIdGroup", function () {
			it("The method should return one record", function (done) {
				groupValueDao.findByIdGroup(idGroup2)
					.then(function (result) {
						expect(result.length).eq(1);
						expect(result[0].idGroup).eq(idGroup2);
						expect(result[0].value).eq(objectGroup2);
						done();
					});
			});
		});


		describe("When calling findByIdGroupsInAndContentByAttributeAndValue", function () {
			it("The method should return correct values", function (done) {
				groupValueDao.findByIdGroupsInAndValueByEmbeddedDocument([idGroup3, idGroup4], "idPerson", idPerson4)
					.then(function (result) {
						expect(result.length).eq(1);
						expect(result[0].idGroup).eq(idGroup4);
						done();
					});
			});
		});
	});
});
