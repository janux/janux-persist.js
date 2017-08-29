/**
 * Project janux-persistence
 * Created by ernesto on 8/18/17.
 */

var chai = require('chai');
var expect = chai.expect;
var config = require('config');
const DaoFactory = require("../../../dist/index").DaoFactory;
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const GroupService = require("../../../dist/index").GroupServiceImpl;
const Group = require("../../../dist/index").GroupImpl;
//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;


const name = "a simple names group";
const type = "names";
const code = "code";
const attributes = {code: "code 1"};
const description = "a description";
const item1 = "name 1";
const item2 = "name 2";

describe("Testing group service remove methods", function () {

    var groupContentDao;
    var groupAttributeValueDao;
    var groupDao;
    var groupService;

    beforeEach("Cleaning data and define daos", function (done) {

        groupContentDao = DaoFactory.createGroupContentDao(dbEngine, path);
        groupDao = DaoFactory.createGroupDao(dbEngine, path);
        groupAttributeValueDao = DaoFactory.createGroupAttributesDao(dbEngine, path);
        groupService = new GroupService(groupDao, groupContentDao, groupAttributeValueDao);
        setTimeout(function () {
            groupContentDao.removeAll()
                .then(function () {
                    return groupDao.removeAll();
                })
                .then(function () {
                    return groupAttributeValueDao.removeAll();
                })
                .then(function () {
                    done();
                })
        }, 50);
    });

    function getSampleData() {
        var group = new Group();
        group.type = type;
        group.name = name;
        group.code = code;
        group.description = description;
        group.attributes = attributes;
        group.values.push(item1);
        group.values.push(item2);
        return group;
    }

    describe("When calling remove", function () {
        it("The method should delete the records", function (done) {
            var group = getSampleData();
            groupService.insert(group)
                .then(function (result) {
                    return groupService.remove(group.code);
                })
                .then(function () {
                    return groupDao.count();
                })
                .then(function (result) {
                    expect(result).eq(0);
                    return groupContentDao.count();
                })
                .then(function (result) {
                    expect(result).eq(0);
                    return groupAttributeValueDao.count();
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
                .then(function () {
                    return groupService.removeItem(group.code, item1);
                })
                .then(function () {
                    return groupContentDao.findAll();
                })
                .then(function (result) {
                    expect(result.length).eq(1);
                    expect(result[0].value).eq(item2);
                    done();
                });
        });
    });
});
