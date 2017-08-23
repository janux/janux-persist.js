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


describe("Testing user group service remove method", function () {
    var groupValueDao;
    var groupDao;
    var accountDao;
    var partyDao;
    var userGroupService;
    var userService;
    var sampleUsers;
    var smallSampleUser;
    var anUserToRemove;
    const name = "all users";
    const name2 = "some users";

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
                    smallSampleUser = [sampleUsers[0], sampleUsers[1]];
                    anUserToRemove = sampleUsers[0];
                    done();
                });
        }, 20);

    });

    describe("When calling removeItem", function () {
        it("The method should add the user to the group", function (done) {
            var groupCode;
            //Create the group.
            userGroupService.insertOrUpdate(name2, smallSampleUser)
                .then(function (smallUsersGroup) {
                    groupCode = smallUsersGroup.code;
                    // Remove one user.
                    return userGroupService.remoteItem(name2, anUserToRemove);
                })
                .then(function () {
                    //Check all the data is correct.
                    return groupDao.findOneByCode(groupCode);
                })
                .then(function (resultQuery) {
                    expect(resultQuery).not.to.be.null;
                    return groupValueDao.findByIdGroup(resultQuery.id);
                })
                .then(function (resultGroupItems) {
                    //There must be only one associated user.
                    expect(resultGroupItems.length).eq(1);
                    expect(resultGroupItems[0].value).eq(sampleUsers[1].id);
                    expect(resultGroupItems[0].value).not.eq(anUserToRemove.id);
                    done();
                });
        })
    });


    describe("When calling remove", function () {
        it("The method should remove the group", function (done) {
            var group1;
            var group2;
            userGroupService.insertOrUpdate(name, sampleUsers)
                .then(function (insertedGroup1) {
                    group1 = insertedGroup1;
                    return userGroupService.insertOrUpdate(name2, smallSampleUser);
                })
                .then(function (insertedGroup2) {
                    group2 = insertedGroup2;
                    //Let's delete the first group
                    return userGroupService.remove(group1.name);
                })
                .then(function () {
                    //Call the group deleted. We should expect a reject.
                    return userGroupService.findByName(group1.name);
                })
                .then(function () {
                    expect.fail("There must not be an existing group with the name " + name);
                    done();
                }, function () {
                    //Check there is only one group
                    return groupDao.findByCodesIn([group1.code, group2.code]);
                })
                .then(function (groups) {
                    expect(groups.length).eq(1);
                    expect(groups[0].code).eq(group2.code);
                    //Look for the total amount of group values.
                    return groupValueDao.findAll();
                })
                .then(function (groupValues) {
                    expect(groupValues.length).eq(group2.values.length + 1);
                    done();
                });
        });
    });
});
