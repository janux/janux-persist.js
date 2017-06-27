/**
 * Project janux-persistence
 * Created by ernesto on 6/27/17.
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
const authContextName2 = "A name 2";
const authContextName3 = "A name 3";
const authContextDescription = "A description";
const authContextDescription2 = "A description 2";
const authContextDescription3 = "A description 3";
const permissionBitName1 = "insert";
const permissionBitName2 = "delete";
const permissionBitName3 = "update";
const permissionBitDesc1 = "insert operations";
const permissionBitDesc2 = "delete operations";
const permissionBitDesc3 = "update operations";
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
    name: authContextName3,
    description: authContextDescription3,
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

describe("Testing auth context service update method", function () {

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


        describe("When updating the auth context with correct values.", function () {
            it("The method should not return any error.", function (done) {
                insertedAuthContext.name = authContextName2;
                insertedAuthContext.description = authContextDescription2;
                insertedAuthContext.sortOrder = 1;
                insertedAuthContext.enabled = false;
                insertedAuthContext.permissionBits.splice(0, 1);
                insertedAuthContext.permissionBits.push({
                    name: permissionBitName3,
                    description: permissionBitDesc3,
                    position: 2
                });
                AuthContextService.update(insertedAuthContext)
                    .then(function (result) {
                        expect(result.name).eq(authContextName2);
                        expect(result.description).eq(authContextDescription2);
                        expect(result.lastUpdate).not.to.be.undefined;
                        expect(result.sortOrder).eq(1);
                        expect(result.enabled).eq(false);
                        expect(result.permissionBits.length).eq(2);
                        expect(result.permissionBits[0].id).not.to.be.undefined;
                        expect(result.permissionBits[0].lastUpdate).not.to.be.undefined;
                        expect(result.permissionBits[0].name).eq(permissionBitName2);
                        expect(result.permissionBits[0].description).eq(permissionBitDesc2);
                        expect(result.permissionBits[0].position).eq(1);
                        expect(result.permissionBits[1].id).not.to.be.undefined;
                        expect(result.permissionBits[1].lastUpdate).to.be.undefined;
                        expect(result.permissionBits[1].name).eq(permissionBitName3);
                        expect(result.permissionBits[1].description).eq(permissionBitDesc3);
                        expect(result.permissionBits[1].position).eq(2);
                        return Persistence.authContextDao.findOneById(result.id);
                    })
                    .then(function (resultAuthQuery) {
                        expect(resultAuthQuery.lastUpdate).not.to.be.undefined;
                        return Persistence.permissionBitDao.findAllByIdAuthContext(resultAuthQuery.id);
                    })
                    .then(function (resultQueryBits) {
                        expect(resultQueryBits.length).eq(2);
                        expect(resultQueryBits[0].lastUpdate).not.to.be.undefined;
                        expect(resultQueryBits[1].lastUpdate).to.be.undefined;
                        done();
                    })
                    .catch(function (err) {
                        expect.fail("The method should have inserted the record");
                        done();
                    });
            });
        });

        describe("When updating with a invalid idDisplayName", function () {
            it("The method should return an error", function (done) {
                insertedAuthContext.idDisplayName = invalidId;
                AuthContextService.update(insertedAuthContext)
                    .then(function (result) {
                        expect.fail("The method should not have inserted the record " + JSON.stringify(result));
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(AuthContextService.ID_DISPLAY_NAME);
                        expect(err[0].message).eq(AuthContextService.ID_DISPLAY_NAME_DOES_NOT_EXIST);
                        done();
                    })
            })
        });

        describe("When updating with a duplicated permission bit", function () {
            it("The method should return an error", function (done) {
                insertedAuthContext.permissionBits.push({
                        name: permissionBitName1,
                        description: permissionBitDesc1,
                        position: 2
                    });
                AuthContextService.update(insertedAuthContext)
                    .then(function (result) {
                        expect.fail("The method should not have inserted the record " + JSON.stringify(result));
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(AuthContextService.PERMISSION_BITS);
                        expect(err[0].message).eq(AuthContextService.PERMISSION_BIT_DUPLICATED);
                        done();
                    })
            })
        });

        describe("When updating by deleting all permission bits", function () {
            it("The method should return an error", function (done) {
                insertedAuthContext.permissionBits = [];
                AuthContextService.update(insertedAuthContext)
                    .then(function (result) {
                        expect.fail("The method should not have inserted the record " + JSON.stringify(result));
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(AuthContextService.PERMISSION_BITS);
                        expect(err[0].message).eq(AuthContextService.PERMISSION_BITS_EMPTY);
                        done();
                    })
            })
        });

        describe("When updating by deleting a permission bit that has an association with a role", function () {
            it("The method should return an error", function (done) {
                insertedAuthContext2.permissionBits.splice(0, 1);
                AuthContextService.update(insertedAuthContext2)
                    .then(function (result) {
                        expect.fail("The method should not have inserted the record " + JSON.stringify(result));
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(AuthContextService.PERMISSION_BITS);
                        expect(err[0].message).eq(AuthContextService.PERMISSION_BIT_ASSOCIATED);
                        done();
                    })
            })
        });
    });
});
