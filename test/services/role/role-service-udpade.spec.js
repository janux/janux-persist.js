/**
 * Project janux-persistence
 * Created by ernesto on 6/28/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var BootstrapService = require("../../../dist/index").BootstrapService;
var AuthContextService = require("../../../dist/index").AuthContextService;
var RoleService = require("../../../dist/index").RoleService;
var Persistence = require("../../../dist/index").Persistence;
var DisplayNameEntity = require("../../../dist/index").DisplayNameEntity;
var RoleValidator = require("../../../dist/index").RoleValidator;

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
const roleEnabled = true;
const isRoot = true;
const idParentRole = undefined;
const invalidId = "313030303030303030303030";

const roleName3 = "A role name 3";
const roleDescription3 = "A role description 3";
const roleEnabled3 = false;

describe("Testing role service update method", function () {

    var insertedAuthContext;
    var insertedRole;
    var insertedRole2;

    beforeEach(function (done) {
        BootstrapService.start(dbEngine, dbParams)
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
                done();
            });
    });

    describe("When updating a roles", function () {
        it("The method should not return any error", function (done) {
            insertedRole.name = roleName3;
            insertedRole.description = roleDescription3;
            insertedRole.enabled = roleEnabled3;
            insertedRole.permissionBits = [
                insertedAuthContext.permissionBits[0],
                insertedAuthContext.permissionBits[1],
                insertedAuthContext.permissionBits[2]
            ];
            RoleService.update(insertedRole)
                .then(function (result) {
                    expect(result.name).eq(roleName3);
                    expect(result.dateCreated).not.to.be.undefined;
                    expect(result.lastUpdate).not.to.be.undefined;
                    expect(result.description).eq(roleDescription3);
                    expect(result.enabled).eq(roleEnabled3);
                    expect(result.permissionBits.length).eq(3);
                    expect(result.permissionBits[0]).id = insertedAuthContext.permissionBits[0].id;
                    expect(result.permissionBits[0]).name = insertedAuthContext.permissionBits[0].name;
                    expect(result.permissionBits[0]).description = insertedAuthContext.permissionBits[0].description;
                    expect(result.permissionBits[1]).id = insertedAuthContext.permissionBits[1].id;
                    expect(result.permissionBits[1]).name = insertedAuthContext.permissionBits[1].name;
                    expect(result.permissionBits[1]).description = insertedAuthContext.permissionBits[1].description;
                    expect(result.permissionBits[2]).id = insertedAuthContext.permissionBits[2].id;
                    expect(result.permissionBits[2]).name = insertedAuthContext.permissionBits[2].name;
                    expect(result.permissionBits[2]).description = insertedAuthContext.permissionBits[2].description;
                    done();
                })
                .catch(function (err) {
                    expect.fail("The method should not have sent an error");
                    done();
                });
        });
    });

    describe("When updating a role with null permission bits", function () {
        it("The method should send an error", function (done) {
            insertedRole.permissionBits = null;
            RoleService.update(insertedRole)
                .then(function (result) {
                    expect.fail("Method should have sent en error");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.ROLE_PERMISSION_BIT);
                    expect(err[0].message).eq(RoleService.ROLE_PERMISSION_BITS_EMPTY);
                    done();
                })
        })
    });

    describe("When updating a role with undefined permission bits", function () {
        it("The method should send an error", function (done) {
            insertedRole.permissionBits = undefined;
            RoleService.update(insertedRole)
                .then(function (result) {
                    expect.fail("Method should have sent en error");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.ROLE_PERMISSION_BIT);
                    expect(err[0].message).eq(RoleService.ROLE_PERMISSION_BITS_EMPTY);
                    done();
                })
        })
    });

    describe("When updating a role with invalid permission bits content", function () {
        it("The method should send an error", function (done) {
            insertedRole.permissionBits = [
                {id: null}
            ];
            RoleService.update(insertedRole)
                .then(function (result) {
                    expect.fail("Method should have sent en error");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.ROLE_PERMISSION_BIT);
                    expect(err[0].message).eq(RoleService.PERMISSION_BITS_INVALID);
                    done();
                })
        });
    });
});
