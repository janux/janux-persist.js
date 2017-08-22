/**
 * Project janux-persistence
 * Created by ernesto on 8/22/17.
 */

var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var _ = require('lodash');
const DaoFactory = require("../../../dist/index").DaoFactory;
const DataSourceHandler = require("../../../dist/index").DataSourceHandler;
const UserService = require("../../../dist/index").UserService;
const UserGroupServiceImpl = require("../../../dist/index").UserGroupServiceImpl;
var UserGenerator = require("../../../dist/index").UserGenerator;
//Config files
const serverAppContext = config.get("serverAppContext");
const dbEngine = serverAppContext.db.dbEngine;
const path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;


describe("Testing user group service insert method", function () {
    var groupValueDao;
    var groupDao;
    var accountDao;
    var partyDao;
    var userGroupService;
    var userService;
    var sampleUsers;

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
                    done();
                });
        }, 50);

    });

    describe("When calling insertOrUpdate", function () {
        var name = "all users";
        var insertedGroups;
        it("The method should insert the users to the assigned group", function (done) {
            // Inserting a users group with all the users.
            userGroupService.insertOrUpdate(name, sampleUsers)
                .then(function (newAllUsersGroup) {
                    // Validate the returned group.
                    expect(newAllUsersGroup.name).eq(name);
                    expect(newAllUsersGroup.code).not.to.be.undefined;
                    // Validate the content contains the users.
                    expect(newAllUsersGroup.values).length(sampleUsers.length);
                    // Validate the information is inserted correctly in the database.
                    return groupDao.findAll()
                })
                .then(function (groups) {

                    insertedGroups = groups;
                    // There must be 2 groups, one containing the list of the names.
                    // the other containing the group called "all users";
                    expect(groups.length).eq(2);
                    expect(groups[0].code).eq("USER NAMES LIST");
                    expect(groups[1].name).eq(name);
                    // Validate the content of the group that has all the group names.
                    return groupValueDao.findByIdGroup(groups[0].id);
                })
                .then(function (valuesParentGroup) {
                    // There is only one record called "all users"
                    expect(valuesParentGroup.length).eq(1);
                    expect(valuesParentGroup[0].value.name).eq(name);
                    // The attribute code is the reference to the group that contains all the
                    // users references.
                    return groupDao.findOneByCode(valuesParentGroup[0].value.code)
                })
                .then(function (groupAllUsers) {
                    // This is the group that contains all the users.
                    expect(groupAllUsers).not.to.be.null;
                    // The name must be the one that we inserted.
                    expect(groupAllUsers.name).eq(name);
                    expect(groupAllUsers.code).eq(insertedGroups[1].code);
                    // Let's get the content of the group.
                    return groupValueDao.findByIdGroup(groupAllUsers.id);
                })
                .then(function (groupUserValues) {
                    // The amount of records must be the sames as the amount of users
                    // associated to the group.
                    expect(groupUserValues.length).eq(sampleUsers.length);
                    //Get the ids from the inserted users.
                    var ids = _.map(sampleUsers, function (o) {
                        return o.id;
                    });
                    ids = _.sortBy(ids, function (o) {
                        return o;
                    });

                    // Get the values of the group.
                    var ids2 = _.map(groupUserValues, function (o) {
                        return o.value;
                    });
                    ids2 = _.sortBy(ids2, function (o) {
                        return o;
                    });

                    for (var i = 0; i < groupUserValues.length; i++) {
                        var groupUser = groupUserValues[i];
                        // The attribute idGroup bust be equal to the group whose name is "all users".
                        expect(groupUser.idGroup).eq(insertedGroups[1].id);
                        // The content of the value attribute must be the sames as the Ids of the sample users.
                        expect(ids[i]).eq(ids2[i]);
                    }
                    done();
                });
        })
    });
});
