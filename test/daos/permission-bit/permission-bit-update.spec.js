/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var mongoose = require('mongoose');

var PermissionBitEntity = require("../../../dist/index").PermissionBitEntity;
var PermissionBitLokijsImpl = require("../../../dist/index").PermissionBitLokijsImpl;
var PermissionBitMongodbImpl = require("../../../dist/index").PermissionBitMongodbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var PermissionBitMongoDbSchema = require("../../../dist/index").PermissionBitMongoDbSchema;

//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath, {throttledSaves: true});
var dbEngineUtilLokijs = new DbEngineUtilLokijs('permission-bit-test', lokiDatabase);
var permissionBitDaoLokijs = new PermissionBitLokijsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('permission-bit-test', PermissionBitMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var permissionBitDaoMongodb = new PermissionBitMongodbImpl(dbEngineMongoDb, null);


const name = "A name";
const description = "A description";
const position = 0;
const idAuthContext = "313030303030303030303030";

const name2 = "A name 2";
const description2 = "A description 2";
const position2 = 1;
const idAuthContext2 = "313030303030303030303031";

const newName = "A new name";

describe("Testing permission bit update methods", function () {

    [permissionBitDaoLokijs, permissionBitDaoMongodb].forEach(function (permissionBitDao) {

        var insertedRecord1;
        var insertedRecord2;
        var insertedRecord3;

        beforeEach(function (done) {
            permissionBitDao.deleteAll()
                .then(function () {
                    var permissionBit = new PermissionBitEntity(name, description, position, idAuthContext);
                    var permissionBit2 = new PermissionBitEntity(name2, description2, position2, idAuthContext);
                    var permissionBit3 = new PermissionBitEntity(name, description, position, idAuthContext2);
                    return permissionBitDao.insertMany([permissionBit, permissionBit2, permissionBit3]);
                })
                .then(function (result) {
                    insertedRecord1 = result[0];
                    insertedRecord2 = result[1];
                    insertedRecord3 = result[2];
                    done();
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When updating a record with a duplicated name and auth context", function () {
            it("The method should return an error", function (done) {
                insertedRecord1.name = name2;
                permissionBitDao.update(insertedRecord1)
                    .then(function (res) {
                        expect.fail("The method should not have updated the record");
                        done();
                    }, function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("name");
                        done();
                    })
            });

            it("The method should return an error", function (done) {
                insertedRecord3.idAuthContext = idAuthContext;
                permissionBitDao.update(insertedRecord3)
                    .then(function (res) {
                        expect.fail("The method should not have updated the record");
                        done();
                    }, function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("name");
                        done();
                    })
            });

            describe("When updating a record with valid values", function () {
                it("It should not send an error", function (done) {
                    insertedRecord1.name = newName;
                    permissionBitDao.update(insertedRecord1)
                        .then(function (result) {
                            expect(result.name).eq(newName);
                            expect(result.id).eq(insertedRecord1.id);
                            return permissionBitDao.findOneById(result.id)
                        })
                        .then(function (resultQuery) {
                            expect(resultQuery.id).eq(insertedRecord1.id);
                            expect(resultQuery.name).eq(newName);
                            done()
                        });
                });
            });

            describe("When updating a record with invalid values", function () {
                it("The method should send an error", function (done) {
                    insertedRecord1.name= "     ";
                    permissionBitDao.update(insertedRecord1)
                        .then(function (result) {
                            expect.fail("The method should have not updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq("name");
                            done();
                        })
                })
            });

            describe("When updating a record without an id", function () {
                it("It should return an error", function (done) {
                    var permissionBit = new PermissionBitEntity(name, description, position, idAuthContext);
                    permissionBitDao.update(permissionBit)
                        .then(function (res) {
                            expect.fail("The method should not have updated the record");
                            done();
                        }, function (err) {
                            assert("The method sent an error, is ok");
                            done();
                        });
                })
            });
        });
    });
});
