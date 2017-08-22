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
var GroupValueValidator = require("../../../dist/index").GroupValueValidator;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");
const idGroup = "idGroup";
const objectGroup = "value";
const idGroup2 = "idGroup2";
const objectGroup2 = "objectGroup2";
const objectGroup3 = "objectGroup3";
describe("Testing group values dao update methods", function () {
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

        describe("When calling the method update", function () {
            it("The method should always return an error", function (done) {
                insertedRecord1.objectGroup = objectGroup3;
                groupValueDao.update(insertedRecord1)
                    .then(function (result) {
                        expect.fail("The method should not have updated the record");
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].message).eq(GroupValueValidator.CANT_UPDATE);
                        done();
                    });
            });
        });
    });
});
