/**
 * Project janux-persistence
 * Created by ernesto on 6/28/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var AuthContextService = require("../../../dist/index").AuthContextService;
var BootstrapService = require("../../../dist/index").BootstrapService;
var Persistence = require("../../../dist/index").Persistence;
var DisplayNameEntity = require("../../../dist/index").DisplayNameEntity;
var RolePermissionBitEntity = require("../../../dist/index").RolePermissionBitEntity;
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbParams = dbEngine === BootstrapService.LOKIJS ? lokiJsDBPath : mongoConnUrl;


const authContextName = "A name";
const authContextName2 = "A name 3";
const authContextDescription = "A description";
const authContextDescription2 = "A description 3";
const permissionBitName1 = "insert";
const permissionBitName2 = "delete";
const permissionBitDesc1 = "insert operations";
const permissionBitDesc2 = "delete operations";
const invalidId = "313030303030303030303030";
const idRole = "313030303030303030303031";


var correctAuthContest = {
    name: authContextName,
    description: authContextDescription,
    sortOrder: 0,
    enabled: true,
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

var correctAuthContest2 = {
    name: authContextName2,
    description: authContextDescription2,
    sortOrder: 2,
    enabled: true,
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

describe("Testing auth context service remove method", function () {

    describe("Given the inserted records", function () {

        var displayNameRecord;
        var insertedAuthContext;

        var insertedAuthContext2;
        beforeEach(function (done) {
            BootstrapService.start(dbEngine, dbParams)
                .then(function () {
                    return Persistence.authContextDao.deleteAll();
                })
                .then(function () {
                    return Persistence.permissionBitDao.deleteAll();
                })
                .then(function () {
                    return Persistence.displayNameDao.deleteAll();
                })
                .then(function () {
                    return Persistence.rolePermissionBitDao.deleteAll();
                })
                .then(function () {
                    var displayNameEntity = new DisplayNameEntity();
                    displayNameEntity.displayName = "a name";
                    return Persistence.displayNameDao.insert(displayNameEntity);
                })
                .then(function (inserted) {
                    displayNameRecord = inserted;
                    var auth = correctAuthContest;
                    auth.idDisplayName = displayNameRecord.id;
                    return AuthContextService.insert(auth);
                })
                .then(function (resultInsert) {
                    insertedAuthContext = resultInsert;
                    var auth2 = correctAuthContest2;
                    auth2.idDisplayName = displayNameRecord.id;
                    return AuthContextService.insert(auth2);
                })
                .then(function (resultInsert2) {
                    insertedAuthContext2 = resultInsert2;
                    //Associate the permission bit with a role.
                    var rolePermission = new RolePermissionBitEntity(idRole, insertedAuthContext2.permissionBits[0].id);
                    return Persistence.rolePermissionBitDao.insert(rolePermission);
                })
                .then(function (result) {
                    done();
                });
        });

        describe("When deleting an auth context", function () {
            it("The method should not return any error", function (done) {
                AuthContextService.remove(insertedAuthContext.id)
                    .then(function () {
                        return Persistence.authContextDao.findAll();
                    })
                    .then(function (authContexts) {
                        expect(authContexts.length).eq(1);
                        return Persistence.permissionBitDao.findAll();
                    })
                    .then(function (permissionBits) {
                        expect(permissionBits.length).eq(2);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail("The method should have deleted the record");
                        done();
                    });
            })
        });

        describe("When deleting an auth context with invalid id", function () {
            it("The method should return one error", function (done) {
                AuthContextService.remove(insertedAuthContext)
                    .then(function () {
                        expect.fail("The method should not have deleted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(AuthContextService.AUTH_CONTEXT);
                        expect(err[0].message).eq(AuthContextService.AUTH_CONTEXT_INVALID_ID);
                        done();
                    });
            })
        });

        describe("When deleting an auth context that has permission bits linked to a role", function () {
            it("The method should return one error", function (done) {
                AuthContextService.remove(insertedAuthContext2.id)
                    .then(function () {
                        expect.fail("The method should not have deleted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(AuthContextService.AUTH_CONTEXT);
                        expect(err[0].message).eq(AuthContextService.AUTH_CONTEXT_LINKED_TO_ROLE);
                        done();
                    });
            })
        });

        describe("When deleting an auth context with and id that does no exits in the database", function () {
            it("The method should return one error", function (done) {
                AuthContextService.remove(invalidId)
                    .then(function () {
                        expect.fail("The method should not have deleted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(AuthContextService.AUTH_CONTEXT);
                        expect(err[0].message).eq(AuthContextService.AUTH_CONTEXT_NOT_IN_DATABASE);
                        done();
                    });
            })
        });
    });
});
