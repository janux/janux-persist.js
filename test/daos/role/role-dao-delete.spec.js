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


describe("Testing role dao delete", function () {
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


            describe("When calling delete all", function () {
                it("It should delete all records", function (done) {
                    roleDao.deleteAll()
                        .then(function () {
                            return roleDao.count();
                        })
                        .then(function (count) {
                            expect(count).eq(0);
                            done();
                        });
                });
            });

            describe("When deleting one record", function () {
                it("It should delete it", function (done) {
                    roleDao.remove(insertedRecord)
                        .then(function () {
                            return roleDao.count();
                        })
                        .then(function (count) {
                            expect(count).eq(1);
                            done();
                        });
                });
            });
        });
    });
});
