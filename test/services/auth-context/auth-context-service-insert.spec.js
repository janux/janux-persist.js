/**
 * Project janux-persistence
 * Created by ernesto on 6/26/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var AuthContextService = require("../../../dist/index").AuthContextService;
var BootstrapService = require("../../../dist/index").BootstrapService;
var Persistence = require("../../../dist/index").Persistence;
var DisplayNameEntity = require("../../../dist/index").DisplayNameEntity;
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
const invalidId = "313030303030303030303030";


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

describe("Testing auth context service insert method", function () {

    var displayNameRecord;

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
                var displayNameEntity = new DisplayNameEntity();
                displayNameEntity.displayName = "a name";
                return Persistence.displayNameDao.insert(displayNameEntity);
            })
            .then(function (inserted) {
                displayNameRecord = inserted;
                done();
            });
    });


    describe("When calling insert with the correct data", function () {
        it("The method should return an error", function (done) {
            var authContext = correctAuthContest;
            authContext.idDisplayName = displayNameRecord.id;
            AuthContextService.insert(authContext)
                .then(function (result) {
                    expect(result.id).not.to.be.undefined;
                    expect(result.dateCreated).not.to.be.undefined;
                    expect(result.name).eq(authContextName);
                    expect(result.description).eq(authContextDescription);
                    expect(result.sortOrder).eq(0);
                    expect(result.enabled).eq(true);
                    expect(result.permissionBits.length).eq(2);
                    expect(result.permissionBits[0].dateCreated).not.to.be.undefined;
                    expect(result.permissionBits[1].dateCreated).not.to.be.undefined;
                    return Persistence.authContextDao.findAll();
                })
                .then(function (resultQueryAuthContext) {
                    expect(resultQueryAuthContext.length).eq(1);
                    expect(resultQueryAuthContext[0].dateCreated).not.to.be.undefined;
                    return Persistence.permissionBitDao.findAll();
                })
                .then(function (resultQueryPermissionBit) {
                    expect(resultQueryPermissionBit.length).eq(2);
                    expect(resultQueryPermissionBit[0].dateCreated).not.to.be.undefined;
                    expect(resultQueryPermissionBit[1].dateCreated).not.to.be.undefined;
                    done();
                })
                .catch(function (err) {
                    expect.fail("The method should have inserted the records");
                    done();
                });
        });
    });

    describe("When calling insert with no permission bits", function () {
        it("The method should return an error", function (done) {
            var authToInsert = {
                name: authContextName,
                description: authContextDescription,
                sortOrder: 0,
                enabled: true,
                idDisplayName: displayNameRecord.id,
                permissionBits: []
            };
            AuthContextService.insert(authToInsert)
                .then(function (result) {
                    expect.fail("The method should have inserted the records");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].message).eq(AuthContextService.PERMISSION_BITS_EMPTY);
                    expect(err[0].attribute).eq(AuthContextService.PERMISSION_BITS);
                    done();
                });
        });

        it("The method should return an error when null", function (done) {
            var authToInsert = {
                name: authContextName,
                description: authContextDescription,
                sortOrder: 0,
                enabled: true,
                idDisplayName: displayNameRecord.id,
                permissionBits: null
            };

            AuthContextService.insert(authToInsert)
                .then(function (result) {
                    expect.fail("The method should have inserted the records");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].message).eq(AuthContextService.PERMISSION_BITS_EMPTY);
                    expect(err[0].attribute).eq(AuthContextService.PERMISSION_BITS);
                    done();
                });
        })
    });

    describe("When calling insert with duplicated permission bits", function () {
        it("The method should return an error", function (done) {
            var authToInsert = {
                name: authContextName,
                description: authContextDescription,
                sortOrder: 0,
                enabled: true,
                idDisplayName: displayNameRecord.id,
                permissionBits: [
                    {
                        name: permissionBitName1,
                        description: permissionBitDesc1,
                        position: 0
                    },
                    {
                        name: permissionBitName1,
                        description: permissionBitDesc2,
                        position: 1
                    }
                ]
            };
            AuthContextService.insert(authToInsert)
                .then(function (result) {
                    expect.fail("The method should have inserted the records");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(AuthContextService.PERMISSION_BITS);
                    expect(err[0].message).eq(AuthContextService.PERMISSION_BIT_DUPLICATED);
                    done();
                });
        });
    });

    describe("When inserting a record with duplicated auth context name", function () {
        it("The method should return an error", function (done) {
            //Inserting the record.
            var authContext = correctAuthContest;
            authContext.idDisplayName = displayNameRecord.id;
            AuthContextService.insert(authContext)
                .then(function (result) {
                    var authContext = correctAuthContest;
                    authContext.idDisplayName = displayNameRecord.id;
                    return AuthContextService.insert(authContext);
                })
                .then(function () {
                    expect.fail("The method should not have inserted the records");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    Persistence.authContextDao.count()
                        .then(function (countAuthContext) {
                            expect(countAuthContext).eq(1);
                            return Persistence.permissionBitDao.count();
                        })
                        .then(function (countPermissionBit) {
                            expect(countPermissionBit).eq(2);
                            done();
                        })
                });
        })
    });

    describe("When inserting a record with invalid display name id", function () {
        it("The method should return an error", function (done) {
            var authContext = correctAuthContest;
            authContext.idDisplayName = invalidId;
            AuthContextService.insert(authContext)
                .then(function (result) {
                    expect.fail("The method should not have inserted the records");
                    done();
                })
                .catch(function (err) {
                    expect(err.length).eq(1);
                    expect(err[0].attribute).eq(AuthContextService.ID_DISPLAY_NAME);
                    expect(err[0].message).eq(AuthContextService.ID_DISPLAY_NAME_DOES_NOT_EXIST);
                    expect(err[0].value).eq(invalidId);
                    done();
                });
        })
    })
});
