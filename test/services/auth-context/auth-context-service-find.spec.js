/**
 * Project janux-persistence
 * Created by ernesto on 6/27/17.
 */
var chai = require('chai');
var expect = chai.expect;
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
const authContextDescription = "A description";
const authContextDescription2 = "A description 2";
const permissionBitName1 = "insert";
const permissionBitName2 = "delete";
const permissionBitDesc1 = "insert operations";
const permissionBitDesc2 = "delete operations";
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
        }
    ]
};

describe("Testing auth context service find methods", function () {

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

        describe("When calling findAll", function () {
            it("The method should return all inserted records", function (done) {
                AuthContextService.findAll()
                    .then(function (result) {
                        expect(result.length).eq(2);
                        var record1 = result[0];
                        var record2 = result[1];
                        expect(record1.id).eq(insertedAuthContext.id);
                        expect(record1.name).eq(insertedAuthContext.name);
                        expect(record1.description).eq(insertedAuthContext.description);
                        expect(record1.sortOrder).eq(insertedAuthContext.sortOrder);
                        expect(record1.permissionBits.length).eq(2);
                        expect(record1.permissionBits[0].name).eq(insertedAuthContext.permissionBits[0].name);
                        expect(record1.permissionBits[0].id).eq(insertedAuthContext.permissionBits[0].id);
                        expect(record1.permissionBits[0].description).eq(insertedAuthContext.permissionBits[0].description);
                        expect(record1.permissionBits[1].name).eq(insertedAuthContext.permissionBits[1].name);
                        expect(record1.permissionBits[1].id).eq(insertedAuthContext.permissionBits[1].id);
                        expect(record1.permissionBits[1].description).eq(insertedAuthContext.permissionBits[1].description);
                        expect(record2.id).eq(insertedAuthContext2.id);
                        expect(record2.name).eq(insertedAuthContext2.name);
                        expect(record2.description).eq(insertedAuthContext2.description);
                        expect(record2.sortOrder).eq(insertedAuthContext2.sortOrder);
                        expect(record2.permissionBits.length).eq(1);
                        expect(record2.permissionBits[0].name).eq(insertedAuthContext2.permissionBits[0].name);
                        expect(record2.permissionBits[0].id).eq(insertedAuthContext2.permissionBits[0].id);
                        expect(record2.permissionBits[0].description).eq(insertedAuthContext2.permissionBits[0].description);
                        done();
                    })
            })
        });

        describe("When calling findOneById", function () {
            it("The method should return an record", function (done) {
                AuthContextService.findOneById(insertedAuthContext2.id)
                    .then(function (result) {
                        expect(result).not.to.be.null;
                        expect(result).not.to.be.undefined;
                        expect(result.id).eq(insertedAuthContext2.id);
                        expect(result.name).eq(insertedAuthContext2.name);
                        expect(result.description).eq(insertedAuthContext2.description);
                        expect(result.sortOrder).eq(insertedAuthContext2.sortOrder);
                        expect(result.permissionBits.length).eq(1);
                        expect(result.permissionBits[0].name).eq(insertedAuthContext2.permissionBits[0].name);
                        expect(result.permissionBits[0].id).eq(insertedAuthContext2.permissionBits[0].id);
                        expect(result.permissionBits[0].description).eq(insertedAuthContext2.permissionBits[0].description);
                        done();
                    })
            })
        });
    });
});
