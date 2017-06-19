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

describe("Testing permission bit insert methods", function () {

    [permissionBitDaoLokijs, permissionBitDaoMongodb].forEach(function (permissionBitDao) {
        beforeEach(function (done) {
            permissionBitDao.deleteAll()
                .then(function () {
                    done()
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When inserting a valid entity", function () {
            it("The entity should exits in the database", function (done) {
                var permissionBit = new PermissionBitEntity(name, description, position, idAuthContext);
                permissionBitDao.insert(permissionBit)
                    .then(function (result) {
                        expect(result.id).not.to.be.null;
                        expect(result.name).eq(name);
                        expect(result.description).eq(description);
                        expect(result.position).eq(position);
                        expect(result.idAuthContext).eq(idAuthContext);
                        return permissionBitDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.id).not.to.be.null;
                        expect(resultQuery.name).eq(name);
                        expect(resultQuery.description).eq(description);
                        expect(resultQuery.position).eq(position);
                        expect(resultQuery.idAuthContext).eq(idAuthContext);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail(("It should have inserted the record"));
                        done();
                    })
            });
        });

        describe("When inserting many records", function () {
            it("The method should have inserted the record", function (done) {
                var permissionBit = new PermissionBitEntity(name, description, position, idAuthContext);
                var permissionBit2 = new PermissionBitEntity(name2, description2, position2, idAuthContext);
                permissionBitDao.insertMany([permissionBit, permissionBit2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        return permissionBitDao.findAll();
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.length).eq(2);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail("It should have inserted the records");
                        done();
                    });

            });
        });

        describe("When inserting a duplicated record", function () {
            it("The method should return an error", function (done) {
                var permissionBit = new PermissionBitEntity(name, description, position, idAuthContext);
                permissionBitDao.insert(permissionBit)
                    .then(function (result) {
                        var permissionBit2 = new PermissionBitEntity(name, description, position, idAuthContext);
                        return permissionBitDao.insert(permissionBit2);
                    })
                    .then(function (res) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("name");
                        done();
                    })
            });
        });


        describe("When inserting record with the same name but different auth context", function () {
            it("The method should insert the record with no problems", function (done) {
                var permissionBit = new PermissionBitEntity(name, description, position, idAuthContext);
                permissionBitDao.insert(permissionBit)
                    .then(function (resultFirstInsert) {
                        var permissionBit2 = new PermissionBitEntity(name, description, position, idAuthContext2);
                        return permissionBitDao.insert(permissionBit2)
                            .then(function (resultSecondInert) {
                                expect(resultSecondInert.id).not.eq(resultFirstInsert.id);
                                expect(resultSecondInert.name).eq(resultFirstInsert.name);
                                expect(resultSecondInert.description).eq(resultFirstInsert.description);
                                expect(resultSecondInert.position).eq(resultFirstInsert.position);
                                expect(resultSecondInert.idAuthContext).not.eq(resultFirstInsert.idAuthContext);
                                done();
                            });
                    })
                    .catch(function (err) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
            });
        });
    })
});
