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
const attributes = {code: "code 1", parent: "root"};
const description = "a description";
const item1 = "name 1";
const item2 = "name 2";

const nameB = "a second list of names";
const codeB = "names2";
const descriptionB = "a description";
const attributesB = {code: "code 2", parent: "root"};
const item2B = "name 5";

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

    function getSampleData2() {
        var group2 = new Group();
        group2.type = type;
        group2.name = nameB;
        group2.code = codeB;
        group2.description = descriptionB;
        group2.attributes = attributesB;
        group2.values.push(item1);
        group2.values.push(item2);
        group2.values.push(item2B);
        return group2
    }

    describe("When calling remove", function () {
        it("The method should delete the records", function (done) {
            var group = getSampleData();
            groupService.insert(group)
                .then(function () {
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
            expect(group.values.length).eq(2);
            var group2 = getSampleData2();
            groupService.insert(group)
                .then(function () {
                    return groupService.insert(group2);
                })
                .then(function () {
                    return groupService.removeItem(group.code, item1);
                })
                .then(function () {
                    return groupContentDao.findAll();
                })
                .then(function (result) {
                    expect(result.length).eq(4);
                    expect(result[0].value).eq(item2);
                    return groupService.findOne(group.code);

                })
                .then(function (resultQuery) {
                    expect(resultQuery.values.length).eq(1);
                    expect(resultQuery.values[0]).eq(item2);
                    done();
                });
        });
    });

    describe("When calling removeItemByType with a item inside two groups", function () {
        it("The method should delete the item inside the two groups", function (done) {
            var group = getSampleData();
            expect(group.values.length).eq(2);
            var group2 = getSampleData2();
            groupService.insert(group)
                .then(function () {
                    return groupService.insert(group2);
                })
                .then(function () {
                    return groupService.removeItemByType(group.type, item1);
                })
                .then(function () {
                    //Validating the item was removed inside the two groups.
                    return groupService.findOne(group.code);
                })
                .then(function (resultQuery) {
                    expect(resultQuery.values.length).eq(1);
                    expect(resultQuery.values[0]).eq(item2);
                    return groupService.findOne(group2.code);
                })
                .then(function (resultQuery2) {
                    expect(resultQuery2.values.length).eq(2);
                    expect(resultQuery2.values[0]).eq(item2);
                    expect(resultQuery2.values[1]).eq(item2B);
                    done();
                });
        })
    })
});
