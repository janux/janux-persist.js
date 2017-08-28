/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
const DaoFactory = require("../../../dist/index").DaoFactory;
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const GroupValidator = require("../../../dist/index").GroupValidator;
const GroupService = require("../../../dist/index").GroupServiceImpl;
const Group = require("../../../dist/index").GroupImpl;
//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;


const name = "a name";
const code = "a code";
const description = "a description";
const item1 = "item 1";
const item2 = "item 2";
const item3 = "item 3";

describe("Testing group service insert methods", function () {

    var groupValueDao;
    var groupDao;
    var groupService;

    beforeEach("Cleaning data and define daos", function (done) {

        groupValueDao = DaoFactory.createGroupValueDao(dbEngine, path);
        groupDao = DaoFactory.createGroupDao(dbEngine, path);
        groupService = new GroupService(groupDao, groupValueDao);
        setTimeout(function () {
            groupValueDao.removeAll()
                .then(function () {
                    return groupDao.removeAll();
                })
                .then(function () {
                    done();
                })
        }, 50);
    });

    function getSampleData() {
        var group = new Group();
        group.name = name;
        group.code = code;
        group.description = description;
        group.values.push(item1);
        group.values.push(item2);
        return group;
    }


    describe("When calling insert with correct values", function () {
        it("The method should insert the record", function (done) {
            var group = getSampleData();
            var idReference;
            groupService.insert(group)
                .then(function (result) {
                    expect(result.name).eq(name);
                    expect(result.code).eq(code);
                    expect(result.description).eq(description);
                    expect(result.values.length).eq(2);
                    return groupDao.findAll();
                })
                .then(function (result) {
                    expect(result.length).eq(1);
                    expect(result[0].id).not.to.be.undefined;
                    expect(result[0].name).eq(name);
                    expect(result[0].code).eq(code);
                    expect(result[0].description).eq(description);
                    idReference = result[0].id;
                    return groupValueDao.findAll();
                })
                .then(function (result) {
                    expect(result.length).eq(2);
                    expect(result[0].idGroup).eq(idReference);
                    expect(result[0].value).eq(item1);
                    expect(result[1].idGroup).eq(idReference);
                    expect(result[1].value).eq(item2);
                    done();
                });
        });
    });

    describe("When inserting with a duplicated code", function () {
        it("The method should return an error", function (done) {
            var group = getSampleData();
            groupService.insert(group)
                .then(function (result) {
                    var group2 = getSampleData();
                    return groupService.insert(group2)
                })
                .then(function (result) {
                    expect.fail("The method should not have inserted the group");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(GroupValidator.ATTRIBUTES);
                    expect(err[0].message).eq(GroupValidator.CODE_DUPLICATED);
                    done();
                });
        });
    });

    describe("When calling the method add item", function () {
        it("The method should insert the new item", function (done) {
            var group = getSampleData();
            groupService.insert(group)
                .then(function (result) {
                    return groupService.addItem(group.code, item3);
                })
                .then(function () {
                    return groupValueDao.findAll();
                })
                .then(function (result) {
                    expect(result.length).eq(3);
                    done();
                });
        });
    });

});
