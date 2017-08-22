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

describe("Testing group service remove methods", function () {

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

    describe("When calling remove", function () {
        it("The method should delete the records", function (done) {
            var group = getSampleData();
            groupService.insert(group)
                .then(function (result) {
                    return groupService.remove(group);
                })
                .then(function () {
                    return groupDao.count();
                })
                .then(function (result) {
                    expect(result).eq(0);
                    return groupValueDao.count();
                })
                .then(function (result) {
                    expect(result).eq(0);
                    done();
                });
        });
    });

    describe("When calling remove item", function () {
        it("The method should remove the item", function (done) {
            var group = getSampleData();
            groupService.insert(group)
                .then(function (result) {
                    return groupService.removeItem(group.code, item1);
                })
                .then(function () {
                    return groupValueDao.findAll();
                })
                .then(function (result) {
                    expect(result.length).eq(1);
                    expect(result[0].value).eq(item2);
                    done();
                });
        });
    });
});
