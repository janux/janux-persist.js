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


describe("Testing group dao insert methods", function () {
    [DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
        var groupDao;

        beforeEach(function (done) {
            var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
            groupDao = DaoFactory.createGroupDao(dbEngine, path);
            groupDao.removeAll()
                .then(function () {
                    done()
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When inserting a valid group", function () {
            it("The entity should exits in the database", function (done) {
                var group = new GroupEntity();
                group.name = groupName1;
                group.code = groupCode1;
                group.description = groupDescription1;

                groupDao.insert(group)
                    .then(function (result) {
                        expect(result.id).not.to.be.undefined;
                        validateRecord(result);
                        return groupDao.findOne(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.id).not.to.be.undefined;
                        validateRecord(resultQuery);
                        done();
                    })
            });

            function validateRecord(record) {
                expect(record.name).eq(groupName1);
                expect(record.code).eq(groupCode1);
                expect(record.description).eq(groupDescription1);
            }
        });


        describe("When inserting a record whit invalid info", function () {
            it("The method must return an error", function (done) {
                var group = new GroupEntity();
                group.name = "";
                group.code = groupCode1;
                group.description = groupDescription1;

                groupDao.insert(group)
                    .then(function (res) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(GroupValidator.NAME);
                        expect(err[0].message).eq(GroupValidator.NAME_EMPTY);
                        done();
                    })
            });
        });

        describe("When inserting a second group with the same code", function () {
            it("The method should return an error", function (done) {
                var group = new GroupEntity();
                group.name = groupName1;
                group.code = groupCode1;
                group.description = groupDescription1;

                groupDao.insert(group)
                    .then(function (result) {
                        var duplicatedGroup = new GroupEntity();
                        duplicatedGroup.name = groupName2;
                        duplicatedGroup.code = groupCode1;
                        duplicatedGroup.description = groupDescription2;
                        return groupDao.insert(duplicatedGroup);
                    })
                    .then(function (result) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(GroupValidator.ATTRIBUTES);
                        expect(err[0].message).eq(GroupValidator.CODE_DUPLICATED);
                        done();
                    })
            })
        });


        describe("When inserting many records", function () {
            it("The method should have inserted the records", function (done) {

                var group1 = new GroupEntity();
                group1.name = groupName1;
                group1.description = groupDescription1;
                group1.code = groupCode1;

                var group2 = new GroupEntity();
                group2.name = groupName2;
                group2.description = groupDescription2;
                group2.code = groupCode2;

                groupDao.insertMany([group1, group2])
                    .then(function (resultInsert) {
                        expect(resultInsert.length).eq(2);
                        expect(resultInsert[0].id).not.to.be.undefined;
                        expect(resultInsert[0].name).eq(groupName1);
                        expect(resultInsert[0].description).eq(groupDescription1);
                        expect(resultInsert[0].code).eq(groupCode1);


                        expect(resultInsert[1].id).not.to.be.undefined;
                        expect(resultInsert[1].name).eq(groupName2);
                        expect(resultInsert[1].description).eq(groupDescription2);
                        expect(resultInsert[1].code).eq(groupCode2);

                        done();
                        return groupDao.count();
                    })
                    .then(function (count) {
                        expect(count).eq(2);
                    });
            });
        });
    });
});
