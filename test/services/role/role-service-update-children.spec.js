/**
 * Project janux-persistence
 * Created by ernesto on 7/4/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var BootstrapService = require("../../../dist/index").BootstrapService;
var AuthContextService = require("../../../dist/index").AuthContextService;
var RoleService = require("../../../dist/index").RoleService;
var Persistence = require("../../../dist/index").Persistence;
var DisplayNameEntity = require("../../../dist/index").DisplayNameEntity;

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
const roleDescription = "A role description";
const roleEnabled = true;
const isRoot = true;
const idParentRole = undefined;
const roleName2 = "A second role name";
const roleDescription2 = "A second role description";


const subRoleName1 = "sub role name 1";
const subRoleDesc1 = "sub role desc 1";
const subRoleName2 = "sub role name 2";
const subRoleDesc2 = "sub role desc 2";
const subRoleName3 = "sub role name 3";
const subRoleDesc3 = "sub role desc 3";
const invalidId = "313030303030303030303030";

describe("Testing role service insert method with children", function () {
    var insertedAuthContext;
    var insertedRole;

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
                var role = {
                    name: roleName,
                    description: roleDescription,
                    enabled: roleEnabled,
                    isRoot: isRoot,
                    idParentRole: idParentRole,
                    permissionBits: [
                        {id: insertedAuthContext.permissionBits[0].id},
                        {id: insertedAuthContext.permissionBits[1].id}
                    ],
                    subRoles: [
                        {
                            name: subRoleName1,
                            description: subRoleDesc1,
                            enabled: true,
                            permissionBits: [
                                {id: insertedAuthContext.permissionBits[0].id},
                                {id: insertedAuthContext.permissionBits[1].id}
                            ]
                        },
                        {
                            name: subRoleName2,
                            description: subRoleDesc2,
                            enabled: false,
                            permissionBits: [
                                {id: insertedAuthContext.permissionBits[1].id}
                            ]
                        }
                    ]
                };
                return RoleService.insert(role);
            })
            .then(function (result) {
                insertedRole = result;
                done();
            });
    });


    /*describe("When updating a role", function () {
        it("The method should not return an error", function (done) {
            insertedRole.name = roleName2;
            insertedRole.description = roleDescription2;
            insertedRole.enabled = false;

            done();
        });
    })*/
});
