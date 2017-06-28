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
const permissionBitDesc1 = "insert operations";
const permissionBitDesc2 = "delete operations";
const roleName = "A role name";
const roleName2 = "A role name 2";
const roleDescription = "A role description";
const roleDescription2 = "A role description 2";
const roleEnabled = true;
const isRoot = true;
const idParentRole = undefined;
const invalidId = "313030303030303030303030";


describe("Testing role service insert method", function () {

    var insertedAuthContext;

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
                        }
                    ]
                };
                return AuthContextService.insert(authContext);
            })
            .then(function (insertedResult) {
                insertedAuthContext = insertedResult;
                done();
            });
    });

    describe("When inserting a role with valid content", function () {
        it("The method should not return an error", function (done) {
            var roleToInsert = {
                name: roleName,
                description: roleDescription,
                enabled: roleEnabled,
                isRoot: isRoot,
                idParentRole: idParentRole,
                permissionBits: [
                    {id: insertedAuthContext.permissionBits[0].id},
                    {id: insertedAuthContext.permissionBits[1].id}
                ]
            };
            RoleService.insert(roleToInsert)
                .then(function (result) {
                    expect(result.id).not.to.be.undefined;
                    expect(result.name).eq(roleName);
                    expect(result.description).eq(roleDescription);
                    expect(result.enabled).eq(roleEnabled);
                    expect(result.dateCreated).not.to.be.undefined;
                    expect(result.isRoot).eq(isRoot);
                    expect(result.idParentRole).to.be.undefined;
                    expect(result.permissionBits.length).eq(2);
                    expect(result.permissionBits[0].id).eq(insertedAuthContext.permissionBits[0].id);
                    expect(result.permissionBits[0].name).eq(insertedAuthContext.permissionBits[0].name);
                    expect(result.permissionBits[0].description).eq(insertedAuthContext.permissionBits[0].description);
                    expect(result.permissionBits[0].dateCreated).not.to.be.undefined;
                    expect(result.permissionBits[0].authContext.name).eq(insertedAuthContext.name);
                    expect(result.permissionBits[0].authContext.id).eq(insertedAuthContext.id);
                    expect(result.permissionBits[1].id).eq(insertedAuthContext.permissionBits[1].id);
                    expect(result.permissionBits[1].name).eq(insertedAuthContext.permissionBits[1].name);
                    expect(result.permissionBits[1].description).eq(insertedAuthContext.permissionBits[1].description);
                    expect(result.permissionBits[1].dateCreated).not.to.be.undefined;
                    expect(result.permissionBits[1].authContext.name).eq(insertedAuthContext.name);
                    expect(result.permissionBits[1].authContext.id).eq(insertedAuthContext.id);
                    done();
                })
                .catch(function (err) {
                    expect.fail("The method should have inserted the records");
                    done();
                })
        })
    });

    describe("When inserting a sub role", function () {
        var insertedParentRole;
        it("The method should not return any error", function (done) {
            var roleToInsert = {
                name: roleName,
                description: roleDescription,
                enabled: roleEnabled,
                isRoot: isRoot,
                idParentRole: idParentRole,
                permissionBits: [
                    {id: insertedAuthContext.permissionBits[0].id},
                    {id: insertedAuthContext.permissionBits[1].id}
                ]
            };
            RoleService.insert(roleToInsert)
                .then(function (insertedRole) {
                    insertedParentRole = insertedRole;
                    var secondRole = {
                        name: roleName2,
                        description: roleDescription2,
                        enabled: roleEnabled,
                        isRoot: false,
                        idParentRole: insertedRole.id,
                        permissionBits: [
                            {id: insertedAuthContext.permissionBits[0].id},
                            {id: insertedAuthContext.permissionBits[1].id}
                        ]
                    };
                    return RoleService.insert(secondRole)
                })
                .then(function (resultSecondInsert) {
                    expect(resultSecondInsert.idParentRole).eq(insertedParentRole.id);
                    done();
                })
                .catch(function (err) {
                    expect.fail("The method should not have returned an error");
                })
        });
    });

    describe("When inserting a role with invalid role info", function () {
        it("The method should return an error", function (done) {
            var roleToInsert = {
                name: "   ",
                description: roleDescription,
                enabled: roleEnabled,
                isRoot: isRoot,
                idParentRole: idParentRole,
                permissionBits: [
                    {id: insertedAuthContext.permissionBits[0].id},
                    {id: insertedAuthContext.permissionBits[1].id}
                ]
            };
            RoleService.insert(roleToInsert)
                .then(function (result) {
                    expect.fail("The method should not have inserted the record");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleValidator.NAME);
                    expect(err[0].message).eq(RoleValidator.NAME_EMPTY);
                    done();
                });
        })
    });

    describe("When inserting a role with invalid permission bit info", function () {
        it("The method should return an error", function (done) {
            var roleToInsert = {
                name: roleName,
                description: roleDescription,
                enabled: roleEnabled,
                isRoot: isRoot,
                idParentRole: idParentRole,
                permissionBits: undefined
            };
            RoleService.insert(roleToInsert)
                .then(function (result) {
                    expect.fail("The method should not have inserted the record");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.ROLE_PERMISSION_BIT);
                    expect(err[0].message).eq(RoleService.ROLE_PERMISSION_BITS_EMPTY);
                    done();
                });
        })
    });

    describe("When inserting a role with invalid permission bit info", function () {
        it("The method should return an error", function (done) {
            var roleToInsert = {
                name: roleName,
                description: roleDescription,
                enabled: roleEnabled,
                isRoot: isRoot,
                idParentRole: idParentRole,
                permissionBits: []
            };
            RoleService.insert(roleToInsert)
                .then(function (result) {
                    expect.fail("The method should not have inserted the record");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.ROLE_PERMISSION_BIT);
                    expect(err[0].message).eq(RoleService.ROLE_PERMISSION_BITS_EMPTY);
                    done();
                });
        })
    });

    describe("When inserting a role with permission bit ids that does not exist in the database.", function () {
        it("The method should return an error", function (done) {
            var roleToInsert = {
                name: roleName,
                description: roleDescription,
                enabled: roleEnabled,
                isRoot: isRoot,
                idParentRole: idParentRole,
                permissionBits: [
                    {id: invalidId},
                    {id: insertedAuthContext.permissionBits[1].id}
                ]
            };
            RoleService.insert(roleToInsert)
                .then(function (result) {
                    expect.fail("The method should not have inserted the record");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.ROLE_PERMISSION_BIT);
                    expect(err[0].message).eq(RoleService.PERMISSION_BIT_NOT_IN_DATABASE);
                    done();
                });
        })
    });

});
