/**
 * Project janux-persistence
 * Created by ernesto on 7/3/17.
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
const idPartenRoleDefined = "313030303030303030303031";

describe("Testing role service insert method with children", function () {
    var insertedAuthContext;
    var roleToInsert;

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
                roleToInsert = {
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
                done();
            });
    });

    describe("When inserting a role with children that has valid info", function () {
        it("The method should not return an error", function (done) {
            RoleService.insert(roleToInsert)
                .then(function (result) {
                    expect(result.id).not.to.be.undefined;
                    expect(result.subRoles.length).eq(2);
                    expect(result.subRoles[1].id).not.to.be.undefined;
                    expect(result.subRoles[0].name).eq(subRoleName1);
                    expect(result.subRoles[0].description).eq(subRoleDesc1);
                    expect(result.subRoles[0].enabled).eq(true);
                    expect(result.subRoles[0].permissionBits.length).eq(2);
                    expect(result.subRoles[0].permissionBits[0].id).eq(insertedAuthContext.permissionBits[0].id);
                    expect(result.subRoles[0].permissionBits[0].name).eq(insertedAuthContext.permissionBits[0].name);
                    expect(result.subRoles[0].permissionBits[0].desc).eq(insertedAuthContext.permissionBits[0].desc);
                    expect(result.subRoles[0].permissionBits[0].authContext).not.to.be.null;
                    expect(result.subRoles[0].permissionBits[0].authContext.id).eq(insertedAuthContext.id);
                    expect(result.subRoles[0].permissionBits[1].id).eq(insertedAuthContext.permissionBits[1].id);
                    expect(result.subRoles[0].permissionBits[1].name).eq(insertedAuthContext.permissionBits[1].name);
                    expect(result.subRoles[0].permissionBits[1].desc).eq(insertedAuthContext.permissionBits[1].desc);
                    expect(result.subRoles[0].permissionBits[1].authContext).not.to.be.null;
                    expect(result.subRoles[0].permissionBits[1].authContext.id).eq(insertedAuthContext.id);

                    expect(result.subRoles[1].id).not.to.be.undefined;
                    expect(result.subRoles[1].name).eq(subRoleName2);
                    expect(result.subRoles[1].description).eq(subRoleDesc2);
                    expect(result.subRoles[1].enabled).eq(false);
                    expect(result.subRoles[1].permissionBits.length).eq(1);
                    expect(result.subRoles[1].permissionBits[0].id).eq(insertedAuthContext.permissionBits[1].id);
                    expect(result.subRoles[1].permissionBits[0].name).eq(insertedAuthContext.permissionBits[1].name);
                    expect(result.subRoles[1].permissionBits[0].desc).eq(insertedAuthContext.permissionBits[1].desc);
                    expect(result.subRoles[1].permissionBits[0].authContext).not.to.be.null;
                    expect(result.subRoles[1].permissionBits[0].authContext.id).eq(insertedAuthContext.id);
                    return Persistence.roleDao.count()
                })
                .then(function (resultCountRoles) {
                    expect(resultCountRoles).eq(3);
                    return Persistence.rolePermissionBitDao.count()
                })
                .then(function (resultCountRolePermissionBits) {
                    expect(resultCountRolePermissionBits).eq(5);
                    done();
                });
        })
    });


    describe("When inserting a role with children that has duplicated names", function () {
        it("The method should return an error", function (done) {
            RoleService.insert(roleToInsert)
                .then(function (insertedRole) {
                    var roleToInsertDuplicated = {
                        name: roleName2,
                        description: roleDescription2,
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
                                name: subRoleName1,
                                description: subRoleDesc1,
                                enabled: true,
                                permissionBits: [
                                    {id: insertedAuthContext.permissionBits[0].id},
                                    {id: insertedAuthContext.permissionBits[1].id}
                                ]
                            }
                        ]
                    };
                    return RoleService.insert(roleToInsertDuplicated);
                })
                .then(function (resultInsert) {
                    expect.fail("The method should not have inserted the record");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.SUB_ROLES_NAMES);
                    expect(err[0].message).eq(RoleService.SUB_ROLES_DUPLICATED_NAMES);
                    return Persistence.roleDao.count()
                        .then(function (roleCount) {
                            expect(roleCount).eq(3);
                            return Persistence.rolePermissionBitDao.count();
                        })
                        .then(function (rolePermissionBitCount) {
                            expect(rolePermissionBitCount).eq(5);
                            done();
                        });
                })
        });
    });

    describe("When inserting a role with children that has duplicated names in the database", function () {
        it("The method should return an error", function (done) {
            RoleService.insert(roleToInsert)
                .then(function (insertedRole) {
                    var roleToInsertDuplicated = {
                        name: roleName2,
                        description: roleDescription2,
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
                            }
                        ]
                    };
                    return RoleService.insert(roleToInsertDuplicated);
                })
                .then(function (resultInsert) {
                    expect.fail("The method should not have inserted the record");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.SUB_ROLES_NAMES);
                    expect(err[0].message).eq(RoleService.SUB_ROLES_DUPLICATED_NAMES_IN_DATABASE);
                    return Persistence.roleDao.count()
                        .then(function (roleCount) {
                            expect(roleCount).eq(3);
                            return Persistence.rolePermissionBitDao.count();
                        })
                        .then(function (rolePermissionBitCount) {
                            expect(rolePermissionBitCount).eq(5);
                            done();
                        });
                })
        })
    });

    describe("When inserting a role with children that has permission bit ids that does not exists in the database", function () {
        it("The method should return an error", function (done) {
            var role = {
                name: roleName2,
                description: roleDescription2,
                enabled: roleEnabled,
                isRoot: isRoot,
                idParentRole: idParentRole,
                permissionBits: [
                    {id: insertedAuthContext.permissionBits[0].id},
                    {id: insertedAuthContext.permissionBits[1].id}
                ],
                subRoles: [
                    {
                        name: subRoleName3,
                        description: subRoleDesc3,
                        enabled: true,
                        permissionBits: [
                            {id: invalidId},
                            {id: insertedAuthContext.permissionBits[1].id}
                        ]
                    }
                ]
            };
            RoleService.insert(role)
                .then(function (resultInsert) {
                    expect.fail("The method should not have inserted the record");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.ROLE_PERMISSION_BIT);
                    expect(err[0].message).eq(RoleService.PERMISSION_BIT_NOT_IN_DATABASE);
                    return Persistence.roleDao.count()
                        .then(function (roleCount) {
                            expect(roleCount).eq(0);
                            return Persistence.rolePermissionBitDao.count();
                        })
                        .then(function (rolePermissionBitCount) {
                            expect(rolePermissionBitCount).eq(0);
                            done();
                        });
                })
        });

        describe("When inserting a role with sub roles that contains an empty array of permission bits", function () {
            it("The method should return an error", function (done) {
                var role = {
                    name: roleName2,
                    description: roleDescription2,
                    enabled: roleEnabled,
                    isRoot: isRoot,
                    idParentRole: idParentRole,
                    permissionBits: [
                        {id: insertedAuthContext.permissionBits[0].id},
                        {id: insertedAuthContext.permissionBits[1].id}
                    ],
                    subRoles: [
                        {
                            name: subRoleName3,
                            description: subRoleDesc3,
                            enabled: true,
                            permissionBits: [
                            ]
                        }
                    ]
                };
                RoleService.insert(role)
                    .then(function (resultInsert) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(RoleService.ROLE_PERMISSION_BIT);
                        expect(err[0].message).eq(RoleService.ROLE_PERMISSION_BITS_EMPTY);
                        return Persistence.roleDao.count()
                            .then(function (roleCount) {
                                expect(roleCount).eq(0);
                                return Persistence.rolePermissionBitDao.count();
                            })
                            .then(function (rolePermissionBitCount) {
                                expect(rolePermissionBitCount).eq(0);
                                done();
                            });
                    })
            });
        });

        describe("When inserting a role with sub roles that contains invalid permission bit info", function () {
            it("The method should return an error", function (done) {
                var role = {
                    name: roleName2,
                    description: roleDescription2,
                    enabled: roleEnabled,
                    isRoot: isRoot,
                    idParentRole: idParentRole,
                    permissionBits: [
                        {id: insertedAuthContext.permissionBits[0].id},
                        {id: insertedAuthContext.permissionBits[1].id}
                    ],
                    subRoles: [
                        {
                            name: subRoleName3,
                            description: subRoleDesc3,
                            enabled: true,
                            permissionBits: [{}]
                        }
                    ]
                };

                RoleService.insert(role)
                    .then(function (resultInsert) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(RoleService.ROLE_PERMISSION_BIT);
                        expect(err[0].message).eq(RoleService.PERMISSION_BITS_INVALID);
                        return Persistence.roleDao.count()
                            .then(function (roleCount) {
                                expect(roleCount).eq(0);
                                return Persistence.rolePermissionBitDao.count();
                            })
                            .then(function (rolePermissionBitCount) {
                                expect(rolePermissionBitCount).eq(0);
                                done();
                            });
                    })
            });
        });
    });

    describe("When inserting a role with children that has an empty name", function () {
        it("The method should return an error", function (done) {
            roleToInsert.subRoles[0].name = "  ";
            RoleService.insert(roleToInsert)
                .then(function (resultInsert) {
                    expect.fail("The method should not have inserted the record");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    return Persistence.roleDao.count()
                        .then(function (roleCount) {
                            expect(roleCount).eq(0);
                            return Persistence.rolePermissionBitDao.count();
                        })
                        .then(function (rolePermissionBitCount) {
                            expect(rolePermissionBitCount).eq(0);
                            done();
                        });
                })
        })
    });


    describe("When inserting a role with children that has invalid parent role data",function () {
        it("The method should insert an error",function (done) {
            roleToInsert.isRoot = false;
            roleToInsert.idParentRole = idPartenRoleDefined;
            RoleService.insert(roleToInsert)
                .then(function (resultInsert) {
                    expect.fail("The method should not have inserted the record");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(RoleService.ROLE);
                    expect(err[0].message).eq(RoleService.PARENT_ROLE_DATA_NOT_VALID);
                    return Persistence.roleDao.count()
                        .then(function (roleCount) {
                            expect(roleCount).eq(0);
                            return Persistence.rolePermissionBitDao.count();
                        })
                        .then(function (rolePermissionBitCount) {
                            expect(rolePermissionBitCount).eq(0);
                            done();
                        });
                });
        })
    })
});
