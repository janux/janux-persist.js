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

// Group with the same type "names"
const type = "names";

const name = "a list of names";
const code = "names1";
const description = "a description";
const attributes = {code: "code 1", parent: "root"};
const item1 = "name 1";
const item2 = "name 2";
const item3 = "name 3";


const nameB = "a second list of names";
const codeB = "names2";
const descriptionB = "a description";
const attributesB = {code: "code 2", parent: "root"};
const item1B = "name 4";
const item2B = "name 5";


// Group with the same type "users"
const usersType = "users";
const usersName = "a list of users";
const usersCode = "users";
const usersDescription = "a list of sample users";
const usersAttributes = {tenantId: "123456", parent: "glarus"};
const usersItem1 = {id: "123456", name: "a name"};

describe("Testing group service find methods", function () {

    var groupContentDao;
    var groupDao;
    var groupService;
    var groupAttributeValueDao;

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
        }, 20);
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
        group.values.push(item3);

        var group2 = new Group();
        group2.type = type;
        group2.name = nameB;
        group2.code = codeB;
        group2.description = descriptionB;
        group2.attributes = attributesB;
        group2.values.push(item1B);
        group2.values.push(item2B);

        var group3 = new Group();
        group3.type = usersType;
        group3.name = usersName;
        group3.code = usersCode;
        group3.description = usersDescription;
        group3.attributes = usersAttributes;
        group3.values.push(usersItem1);

        return [group, group2, group3];
    }

    describe("When calling the method findGroup with the correct code and attributes", function () {
        it("The method should return the group", function (done) {
            var groups = getSampleData();
            groupService.insert(groups[0])
                .then(function () {
                    return groupService.insert(groups[1])
                })
                .then(function () {
                    return groupService.insert(groups[2])
                })
                .then(function () {
                    return groupService.findOne(code);
                })
                .then(function (result) {
                    expect(result.name).eq(name);
                    expect(result.description).eq(description);
                    expect(result.code).eq(code);
                    expect(result.attributes).to.deep.equals(attributes);
                    expect(result.type).eq(type);
                    expect(result.values.length).eq(3);
                    expect(result.values[0]).eq(item1);
                    expect(result.values[1]).eq(item2);
                    expect(result.values[2]).eq(item3);
                    done();
                });
        });
    });

    describe("When calling the method findGroup with the incorrect code", function () {
        it("The method should return a null", function (done) {
            var groups = getSampleData();
            groupService.insert(groups[0])
                .then(function (result) {
                    return groupService.insert(groups[1])
                })
                .then(function (result) {
                    return groupService.insert(groups[2])
                })
                .then(function (result) {
                    return groupService.findOne("invalidCode");
                })
                .then(function (result) {
                    expect(result).to.be.null;
                    done();
                });
        })
    });

    describe("When calling findByTypeAndFilter with empty kay-value", function () {
        it("The method should return 2 groups", function (done) {
            var groups = getSampleData();
            groupService.insert(groups[0])
                .then(function (result) {
                    return groupService.insert(groups[1])
                })
                .then(function (result) {
                    return groupService.insert(groups[2])
                })
                .then(function (result) {
                    return groupService.findByTypeAndFilter(type, {});
                })
                .then(function (groups) {
                    expect(groups.length).eq(2);
                    expect(groups[0].type).eq(type);
                    expect(groups[1].type).eq(type);
                    done();
                });
        });
    });

    describe("When calling findByTypeAndFilter with a shared kay-value", function () {
        it("The method should return 2 groups", function (done) {
            var groups = getSampleData();
            groupService.insert(groups[0])
                .then(function (result) {
                    return groupService.insert(groups[1])
                })
                .then(function (result) {
                    return groupService.insert(groups[2])
                })
                .then(function (result) {
                    return groupService.findByTypeAndFilter(type, {parent: "root"});
                })
                .then(function (groups) {
                    expect(groups.length).eq(2);
                    expect(groups[0].type).eq(type);
                    expect(groups[1].type).eq(type);
                    done();
                });
        });
    });

    describe("When calling findByTypeAndFilter with a unique kay-value", function () {
        it("The method should return 1 group", function (done) {
            var groups = getSampleData();
            groupService.insert(groups[0])
                .then(function (result) {
                    return groupService.insert(groups[1])
                })
                .then(function (result) {
                    return groupService.insert(groups[2])
                })
                .then(function (result) {
                    return groupService.findByTypeAndFilter(type, {code: "code 1"});
                })
                .then(function (groups) {
                    expect(groups.length).eq(1);
                    expect(groups[0].type).eq(type);
                    done();
                });
        });
    });
});
