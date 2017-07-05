/**
 * Project janux-persistence
 * Created by ernesto on 6/30/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var BootstrapService = require("../../../dist/index").BootstrapService;
var AuthContextService = require("../../../dist/index").AuthContextService;
var RoleService = require("../../../dist/index").RoleService;
var Persistence = require("../../../dist/index").Persistence;
var DisplayNameEntity = require("../../../dist/index").DisplayNameEntity;
var PartyValidator = require("../../../dist/index").PartyValidator;
var AccountService = require("../../../dist/index").AccountService;

//Config files
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbParams = dbEngine === BootstrapService.LOKIJS ? lokiJsDBPath : mongoConnUrl;


const authContextName = "A name";
const authContextDescription = "A description";
const permissionBitName1 = "insert";
const permissionBitName2 = "delete";
const permissionBitName3 = "update";
const permissionBitDesc1 = "insert operations";
const permissionBitDesc2 = "delete operations";
const permissionBitDesc3 = "update operations";
const roleName = "A role name";
const roleName2 = "A role name 2";
const roleDescription = "A role description";
const roleDescription2 = "A role description 2";
const personName1 = "John";
const personDisplayName1 = "Display name 1";
const personMiddleName1 = "Doe";
const personLastName1 = "Doe";
const roleEnabled = true;
const isRoot = true;
const contactType1 = "work";
const contactEmail1 = "dev@glarus.com";


const accountUsername1 = "username2";
const accountPassword1 = "password2";
const accountEnabled1 = true;
const accountLocked1 = false;
const accountExpire1 = undefined;
const accountExpirePassword1 = undefined;

describe("Testing role service delete method", function () {

    var insertedAuthContext;
    var insertedRole;
    var insertedRole2;

    beforeEach(function (done) {
        BootstrapService.start(dbEngine, dbParams)
            .then(function () {
                return Persistence.accountDao.deleteAll();
            })
            .then(function () {
                return Persistence.accountRoleDao.deleteAll();
            })
            .then(function () {
                return Persistence.partyDao.deleteAll();
            })
            .then(function () {
                return Persistence.roleDao.deleteAll();
            })
            .then(function () {
                return Persistence.rolePermissionBitDao.deleteAll();
            })
            .then(function () {
                return Persistence.permissionBitDao.deleteAll();
            })
            .then(function () {
                return Persistence.authContextDao.deleteAll();
            })
            .then(function () {
                return Persistence.displayNameDao.deleteAll();
            })
            .then(function () {
                var displayNameEntity = new DisplayNameEntity();
                displayNameEntity.displayName = "a name";
                return Persistence.displayNameDao.insert(displayNameEntity);
            })
            .then(function (insertedDisplayName) {
                var authContext = {
                    name: authContextName,
                    description: authContextDescription,
                    sortOrder: 0,
                    enabled: true,
                    idDisplayName: insertedDisplayName.id,
                    permissionBits: [
                        {
                            name: permissionBitName1,
                            description: permissionBitDesc1,
                            position: 0
                        },
                        {
                            name: permissionBitName2,
                            description: permissionBitDesc2,
                            position: 1
                        },
                        {
                            name: permissionBitName3,
                            description: permissionBitDesc3,
                            position: 2
                        }
                    ]
                };
                return AuthContextService.insert(authContext);
            })
            .then(function (insertedResult) {
                insertedAuthContext = insertedResult;
                var roleToInsert = {
                    name: roleName,
                    description: roleDescription,
                    enabled: roleEnabled,
                    isRoot: isRoot,
                    idParentRole: undefined,
                    permissionBits: [
                        insertedAuthContext.permissionBits[0],
                        insertedAuthContext.permissionBits[1]
                    ]
                };
                return RoleService.insert(roleToInsert);
            })
            .then(function (resultInsertedRole) {
                insertedRole = resultInsertedRole;
                var roleToInsert = {
                    name: roleName2,
                    description: roleDescription2,
                    enabled: roleEnabled,
                    isRoot: isRoot,
                    idParentRole: undefined,
                    permissionBits: [
                        insertedAuthContext.permissionBits[2]
                    ]
                };
                return RoleService.insert(roleToInsert);
            })
            .then(function (resultInsertedRole) {
                insertedRole2 = resultInsertedRole;
                var account = {
                    username: accountUsername1,
                    password: accountPassword1,
                    enabled: accountEnabled1,
                    locked: accountLocked1,
                    expire: accountExpire1,
                    expirePassword: accountExpirePassword1,
                    contact: {
                        type: PartyValidator.PERSON,
                        displayName: personDisplayName1,
                        name: {
                            first: personName1,
                            middle: personMiddleName1,
                            last: personLastName1
                        },
                        emails: [{
                            type: contactType1,
                            primary: true,
                            address: contactEmail1
                        }]
                    },
                    roles: [insertedRole2]
                };
                return AccountService.insert(account);
            })
            .then(function (insertedAccount) {
                done();
            });
    });

    describe("When deleting the role", function () {
        it("The method should not return any error", function (done) {
            RoleService.remove(insertedRole, false)
                .then(function () {
                    return Persistence.roleDao.count();
                })
                .then(function (count) {
                    expect(count).eq(1);
                    done();
                })
                .catch(function (err) {
                    expect.fail("the method should not have returned an error");
                    done();
                })
        });
    });


    describe("When deleting a role with forceDelete as false and the role has account associations", function () {
        it("The method should return an error", function (done) {
            RoleService.remove(insertedRole2, false)
                .then(function () {
                    expect.fail("The method should return an error");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.ACCOUNT);
                    expect(err[0].message).eq(RoleService.ROLE_ASSOCIATED_WITH_ACCOUNT);
                    done();
                })
        });
    });

    describe("When deleting a role with forceDelete as false and the role has account associations", function () {
        it("The method should not return an error and the role must be removed", function (done) {
            RoleService.remove(insertedRole2, true)
                .then(function () {
                    return Persistence.roleDao.count();
                })
                .then(function (count) {
                    expect(count).eq(1);
                    done();
                })
                .catch(function (err) {
                    expect.fail("the method should not have returned an error");
                    done();
                })
        });
    });

});
