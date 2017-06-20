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
var invalidId1 = "313030303030303030303030";
var invalidId2 = "313030303030303030303032";

describe("Testing role dao find", function () {
    [roleDaoLokijs, roleDaoMongodb].forEach(function (roleDao) {
        describe("Given the inserted records", function () {

            var insertedRecord;
            var insertedRecord2;

            beforeEach(function (done) {
                roleDao.deleteAll()
                    .then(function () {
                        var role = new RoleEntity(name, description, true, true, undefined);
                        var role2 = new RoleEntity(name2, description2, true, true, undefined);
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

            describe("When calling findOneByName", function () {
                it("The method should return a record", function (done) {
                    roleDao.findOneByName(name)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            expect(result.name).eq(name);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("The method should have not returned an error");
                            done();
                        });
                });
            });

            describe("When calling the method findAllByIds", function () {
                it("The method should return one record", function (done) {
                    roleDao.findAllByIds([insertedRecord.id, invalidId1, invalidId2])
                        .then(function (result) {
                            expect(result.length).eq(1);
                            expect(result[0].id).eq(insertedRecord.id);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("Error");
                            done();
                        })
                });
            });

            describe("When calling findOneById", function () {
                it("The method should return one record when calling by a inserted id", function (done) {
                    roleDao.findOneById(insertedRecord2.id)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            expect(result.id).eq(insertedRecord2.id);
                            expect(result.name).not.to.be.null;
                            done();
                        });
                });

                it("The method should return null with an invalid id", function (done) {
                    roleDao.findOneById(invalidId1)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        });
                });
            });

            // TODO: validate findAllChildRoles
        });
    });
});
