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


describe("Testing group dao delete methods", function () {
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

        describe("When calling removeAll", function () {
            it("The method should not return an error", function () {
                groupDao.removeAll()
                    .then(function (result) {
                        return groupDao.count()
                    })
                    .then(function (result) {
                        expect(result).eq(0);
                    })
            })
        });

        describe("When calling remove", function () {
            it("The method should not return an error", function () {
                groupDao.remove(insertedRecord1)
                    .then(function (result) {
                        return groupDao.count()
                    })
                    .then(function (result) {
                        expect(result).eq(1);
                    })
            });
        });
    });
});