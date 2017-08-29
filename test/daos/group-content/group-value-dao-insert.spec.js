/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */


var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');

var DaoFactory = require("../../../dist/index").DaoFactory;
var GroupValueEntity = require("../../../dist/index").GroupContentEntity;
var GroupValueValidator = require("../../../dist/index").GroupContentValidator;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");
const idGroup = "idGroup";
const objectGroup = "value";
const idGroup2 = "idGroup2";
const objectGroup2 = "objectGroup2";
describe("Testing group values dao insert methods", function () {
    [DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
        var groupValueDao;

        beforeEach(function (done) {
            var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
            groupValueDao = DaoFactory.createGroupContentDao(dbEngine, path);
            groupValueDao.removeAll()
                .then(function () {
                    done();
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When inserting a valid group values", function () {
            it("The entity should exits in the database", function (done) {
                var groupValue = new GroupValueEntity();
                groupValue.idGroup = idGroup;
                groupValue.value = objectGroup;
                groupValueDao.insert(groupValue)
                    .then(function (result) {
                        validateResult(result);
                        return groupValueDao.findOne(result.id);
                    })
                    .then(function (result) {
                        validateResult(result);
                        done();
                    });
            });

            function validateResult(result) {
                expect(result.id).not.to.be.undefined;
                expect(result.idGroup).eq(idGroup);
                expect(result.value).eq(objectGroup);
            }
        });


        describe("When inserting a group values with invalid info", function () {
            it("The method should return an error", function (done) {
                var groupValue = new GroupValueEntity();
                groupValue.idGroup = idGroup;
                groupValue.value = undefined;
                groupValueDao.insert(groupValue)
                    .then(function () {
                        expect.fail("The method should not have inserted the record");
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(GroupValueValidator.OBJECT_GROUP);
                        expect(err[0].message).eq(GroupValueValidator.OBJECT_GROUP_EMPTY);
                        done();
                    });
            })
        });

        describe("When calling insertMany", function () {
            it("The method should not return any error", function (done) {
                var groupValue = new GroupValueEntity();
                groupValue.idGroup = idGroup;
                groupValue.value = objectGroup;
                var groupValue2 = new GroupValueEntity();
                groupValue2.idGroup = idGroup2;
                groupValue2.value = objectGroup2;
                groupValueDao.insertMany([groupValue, groupValue2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        expect(result[0].id).not.to.be.undefined;
                        expect(result[1].id).not.to.be.undefined;
                        return groupValueDao.count();
                    })
                    .then(function (result) {
                        expect(result).eq(2);
                        done();
                    })
            });
        });
    });
});
