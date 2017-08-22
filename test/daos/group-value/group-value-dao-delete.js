/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */


var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');

var DaoFactory = require("../../../dist/index").DaoFactory;
var GroupValueEntity = require("../../../dist/index").GroupValueEntity;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");
const idGroup = "idGroup";
const objectGroup = "value";
const idGroup2 = "idGroup2";
const objectGroup2 = "objectGroup2";

describe("Testing group value dao delete methods", function () {
    [DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
        var groupValueDao;
        var insertedRecord1;
        var insertedRecord2;
        beforeEach(function (done) {
            var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
            groupValueDao = DaoFactory.createGroupValueDao(dbEngine, path);
            groupValueDao.removeAll()
                .then(function (result) {
                    var groupValue = new GroupValueEntity();
                    groupValue.idGroup = idGroup;
                    groupValue.value = objectGroup;
                    var groupValue2 = new GroupValueEntity();
                    groupValue2.idGroup = idGroup2;
                    groupValue2.value = objectGroup2;
                    groupValueDao.insertMany([groupValue, groupValue2])
                        .then(function (result) {
                            insertedRecord1 = result[0];
                            insertedRecord2 = result[1];
                            done();
                        });
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When calling remove", function () {
            it("The method should delete the record", function (done) {
                groupValueDao.remove(insertedRecord1)
                    .then(function (result) {
                        return groupValueDao.count();
                    })
                    .then(function (result) {
                        expect(result).eq(1);
                        done();
                    });
            });
        });

        describe("When callingRemoveAll", function () {
            it("The method should delete all records", function (done) {
                groupValueDao.removeAll()
                    .then(function (result) {
                        return groupValueDao.count();
                    })
                    .then(function (result) {
                        expect(result).eq(0);
                        done();
                    });
            })
        });

        describe("When calling removeAllByIdGroup", function () {
            it("The method should delete only one record", function (done) {
                groupValueDao.removeAllByIdGroup(idGroup)
                    .then(function (result) {
                        return groupValueDao.findAll();
                    })
                    .then(function (value) {
                        expect(value.length).eq(1);
                        expect(value[0].idGroup).eq(idGroup2);
                        expect(value[0].value).eq(objectGroup2);
                        done();
                    });
            });
        });
    });
});
