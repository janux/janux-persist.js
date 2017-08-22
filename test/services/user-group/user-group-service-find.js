/**
 * Project janux-persistence
 * Created by ernesto on 8/22/17.
 */

var chai = require('chai');
var expect = chai.expect;
var config = require('config');
const DaoFactory = require("../../../dist/index").DaoFactory;
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const UserService = require("../../../dist/index").UserService;
const UserGroupServiceImpl = require("../../../dist/index").UserGroupServiceImpl;
var UserGenerator = require("../../../dist/index").UserGenerator;
//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
const name = "all users";
const name2 = "some users";

describe("Testing user group service find method", function () {
    var groupValueDao;
    var groupDao;
    var accountDao;
    var partyDao;
    var userGroupService;
    var userService;
    var sampleUsers;
    var subListUsers;

    beforeEach(function (done) {
        groupValueDao = DaoFactory.createGroupValueDao(dbEngine, path);
        groupDao = DaoFactory.createGroupDao(dbEngine, path);
        accountDao = DaoFactory.createAccountDao(dbEngine, path);
        partyDao = DaoFactory.createPartyDao(dbEngine, path);
        userService = UserService.createInstance(accountDao, partyDao);
        userGroupService = new UserGroupServiceImpl(groupDao, groupValueDao, userService);
        setTimeout(function () {
            //Clean db.
            groupValueDao.removeAll()
                .then(function () {
                    return groupDao.removeAll();
                })
                .then(function () {
                    return accountDao.removeAll();
                })
                .then(function () {
                    return partyDao.removeAll();
                })
                .then(function () {
                    //Insert sample data.
                    return UserGenerator.generateUserDateInTheDatabase(dbEngine, path);
                })
                .then(function (result) {
                    sampleUsers = result;
                    subListUsers = sampleUsers.splice(2, 1);
                    done();
                });
        }, 50);
    });

    describe("When calling findByName", function () {

        it("The method should get the group with the users", function (done) {
            // Insert the users sample.
            userGroupService.insertOrUpdate(name, sampleUsers)
                .then(function () {
                    return userGroupService.insertOrUpdate(name2, subListUsers);
                })
                .then(function () {
                    //Reassign the users.
                    return userGroupService.findByName(name);
                })
                .then(function (result) {
                    expect(result.name).eq(name);
                    expect(result.values.length).eq(sampleUsers.length);
                    done();
                })
        })
    });
});
