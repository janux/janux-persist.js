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
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const groupName1 = "Group 1";
const groupName2 = "Group 1";
const groupCode1 = "Code 1";
const groupCode2 = "Code 2";
const groupDescription1 = "Description 1";
const groupDescription2 = "Description 2";


describe("Testing group dao find methods", function () {
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


        describe("When calling findOneByCode with the correct value", function () {
            it("The method should return a result", function (done) {
                groupDao.findOneByCode(groupCode2)
                    .then(function (value) {
                        expect(value).not.to.be.undefined;
                        expect(value.id).not.to.be.undefined;
                        expect(value.name).eq(groupName2);
                        expect(value.code).eq(groupCode2);
                        expect(value.description).eq(groupDescription2);
                        done();
                    })
            });
        });

        describe("When calling findOneByCode with the incorrect value", function () {
            it("The method should return a result", function (done) {
                groupDao.findOneByCode("i_do_not_exists")
                    .then(function (value) {
                        expect(value).to.be.null;
                        done();
                    });
            });
        });
    });
});
