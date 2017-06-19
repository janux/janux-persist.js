/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var mongoose = require('mongoose');

var RoleEntity = require("../../../dist/index").RoleEntity;
var RoleDaoLokiJsImpl = require("../../../dist/index").RoleDaoLokiJsImpl;
var RoleDaoMongoDbImpl = require("../../../dist/index").RoleDaoMongoDbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var DisplayNameMongoDbSchema = require("../../../dist/index").RoleMongoDbSchema;

//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath, {throttledSaves: true});
var dbEngineUtilLokijs = new DbEngineUtilLokijs('role-test', lokiDatabase);
var roleDaoLokijs = new RoleDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('role-test', DisplayNameMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var roleDaoMongodb = new RoleDaoMongoDbImpl(dbEngineMongoDb, null);

var name = "A name";
var name2 = "A second name";
var description = "A description";
var description2 = "A  second description";

var name3 = "A third name";
var description3 = "A third description";


describe("Testing role dao update", function () {
    [roleDaoLokijs, roleDaoMongodb].forEach(function (roleDao) {
        describe("Given the inserted records", function () {
            var insertedRecord;
            var insertedRecord2;

            beforeEach(function (done) {
                roleDao.deleteAll()
                    .then(function () {
                        var role = new RoleEntity(name, description, true, false, undefined);
                        var role2 = new RoleEntity(name2, description2, true, false, undefined);
                        return roleDao.insertMany([role, role2])
                    })
                    .then(function (result) {
                        insertedRecord = result[0];
                        insertedRecord2 = result[1];
                        done();
                    })
                    .catch(function (error) {
                        assert.fail("Error");
                        done();
                    });
            });

            describe("When updating a record with a duplicated name", function () {
                it("The method should return an error", function (done) {
                    insertedRecord.name = name2;
                    roleDao.update(insertedRecord)
                        .then(function (result) {
                            expect.fail("The method should have not updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq("name");
                            done();
                        });
                })
            });

            describe("When updating a record with valid values", function () {
                it("It should not send an error", function (done) {
                    insertedRecord.name = name3;
                    insertedRecord.description = description3;
                    insertedRecord.enabled = false;
                    roleDao.update(insertedRecord)
                        .then(function (result) {
                            expect(result.name).eq(name3);
                            expect(result.description).eq(description3);
                            expect(result.enabled).eq(false);
                            expect(result.id).not.to.be.null;
                            expect(result.id).eq(insertedRecord.id);
                            return roleDao.findOneById(result.id)
                        })
                        .then(function (resultQuery) {
                            expect(resultQuery.id).eq(insertedRecord.id);
                            expect(resultQuery.name).eq(name3);
                            expect(resultQuery.description).eq(description3);
                            expect(resultQuery.enabled).eq(false);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("Error");
                            done();
                        });
                });
            });

            describe("When updating a record without an id", function () {
                it("The method should send an error", function (done) {
                    var role = new RoleEntity(name, description, false, false, undefined);
                    roleDao.update(role)
                        .then(function (result) {
                            expect.fail("The method should not have updated the record");
                            done();
                        })
                        .catch(function (err) {
                            assert("The method sent an error, is OK");
                            done();
                        })
                })
            });


        });
    });
});
