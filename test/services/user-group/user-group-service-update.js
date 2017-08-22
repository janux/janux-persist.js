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


describe("Testing user group service update method", function () {
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

    describe("When calling insertOrUpdate for an update", function () {
        var name = "all users";
        it("The method should update the users to the assigned group", function (done) {
            // Insert the users sample.
            userGroupService.insertOrUpdate(name, sampleUsers)
                .then(function () {
                    //Reassign the users.
                    return userGroupService.insertOrUpdate(name, subListUsers);
                })
                .then(function (newAllUsersGroup) {
                    // The updated group must contain only the user from subListUsers.
                    expect(newAllUsersGroup.name).eq(name);
                    expect(newAllUsersGroup.values.length).eq(subListUsers.length);
                    expect(newAllUsersGroup.values).eqls(subListUsers);
                    return groupDao.findAll();
                })
                .then(function (groups) {
                    // No groups must be inserted or deleted.
                    expect(groups.length).eq(2);
                    return groupValueDao.findAll();
                })
                .then(function (groupValues) {
                    // There must be only 2 record. The association with the name and the association with the user.
                    expect(groupValues.length).eq(subListUsers.length + 1);
                    expect(groupValues[1].value).eq(subListUsers[0].id);
                    done();
                });
        })
    });
});
