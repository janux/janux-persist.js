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
const groupCode1 = "Code 1";
const groupCode2 = "Code 2";
const groupDescription1 = "Description 1";
const groupDescription2 = "Description 2";

const groupNameNewValue = "Group new value";
const groupCodeNewValue = "Code new value";
const groupDescriptionNewValue = "Description new value";

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
                    group1.code = groupCode1;

                    var group2 = new GroupEntity();
                    group2.name = groupName2;
                    group2.description = groupDescription2;
                    group2.code = groupCode2;

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
                insertedRecord1.code = groupCodeNewValue;
                insertedRecord1.description = groupDescriptionNewValue;
                groupDao.update(insertedRecord1)
                    .then(function (result) {
                        expect(result.id).eq(id);
                        expect(result.name).eq(groupNameNewValue);
                        expect(result.code).eq(groupCodeNewValue);
                        expect(result.description).eq(groupDescriptionNewValue);
                        return groupDao.findOne(id);
                    })
                    .then(function (result) {
                        expect(result.id).eq(id);
                        expect(result.name).eq(groupNameNewValue);
                        expect(result.code).eq(groupCodeNewValue);
                        expect(result.description).eq(groupDescriptionNewValue);
                        done();
                    });
            })
        });

        describe("When updating the record with incorrect values", function () {
            it("The method should return an error", function (done) {
                insertedRecord1.name = groupNameNewValue;
                insertedRecord1.code = "";
                insertedRecord1.description = groupDescriptionNewValue;
                groupDao.update(insertedRecord1)
                    .then(function (res) {
                        expect.fail("The method should not have updated the record");
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(GroupValidator.CODE);
                        expect(err[0].message).eq(GroupValidator.CODE_EMPTY);
                        done();
                    })
            });
        });


        describe("When updating the record with a duplicated code", function () {
            it("The method should return an error", function (done) {
                insertedRecord1.code = insertedRecord2.code;
                groupDao.update(insertedRecord1)
                    .then(function (res) {
                        expect.fail("The method should not have updated the record");
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(GroupValidator.CODE);
                        expect(err[0].message).eq(GroupValidator.CODE_DUPLICATED);
                        done();
                    })
            });
        });
    });
});
