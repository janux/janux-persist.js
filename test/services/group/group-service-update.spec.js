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
const name2 = "a name 2";
const code = "a code";
const description = "a description";
const description2 = "a description 2";
const item1 = "item 1";
const item2 = "item 2";
const item3 = "item 3";

describe("Testing group service update methods", function () {

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

    describe("When calling update", function () {
        it("The method should update the records", function (done) {
            var group = getSampleData();
            var idReference;
            groupService.insert(group)
                .then(function (result) {
                    result.name = name2;
                    result.description = description2;
                    result.values = [item3];
                    return groupService.update(result);
                })
                .then(function (result) {
                    expect(result.name).eq(name2);
                    expect(result.description).eq(description2);
                    expect(result.code).eq(code);
                    expect(result.values.length).eq(1);
                    expect(result.values[0]).eq(item3);
                    return groupDao.findAll();
                })
                .then(function (result) {

                    expect(result.length).eq(1);
                    expect(result[0].name).eq(name2);
                    expect(result[0].description).eq(description2);
                    expect(result[0].code).eq(code);
                    idReference = result[0].id;
                    return groupValueDao.findAll();
                })
                .then(function (result) {
                    expect(result.length).eq(1);
                    expect(result[0].idGroup).eq(idReference);
                    expect(result[0].value).eq(item3);
                    done();
                });
        });
    })
});
