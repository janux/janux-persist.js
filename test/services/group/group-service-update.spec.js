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


const name = "a name";
const name2 = "a name 2";
const code = "a code";
const description = "a description";
const description2 = "a description 2";
const item1 = "item 1";
const item2 = "item 2";
const item3 = "item 3";

describe("Testing group service update methods", function () {

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
        group.properties.name = name;
        group.properties.description = description;
        group.properties.attributes = attributes;
        group.values.push(item1);
        group.values.push(item2);
        return group;
    }
});
