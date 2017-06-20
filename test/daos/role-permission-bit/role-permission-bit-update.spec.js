/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var mongoose = require('mongoose');

var RolePermissionBitEntity = require("../../../dist/index").RolePermissionBitEntity;
var RolePermissionDao = require("../../../dist/index").RolePermissionDao;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var RolePermissionBitMongoDbSchema = require("../../../dist/index").RolePermissionBitMongoDbSchema;

//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath, {throttledSaves: true});
var dbEngineUtilLokijs = new DbEngineUtilLokijs('role-permission-bit-test', lokiDatabase);
var rolePermissionDaoDaoLokijs = new RolePermissionDao(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('role-permission-bit-test', RolePermissionBitMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var rolePermissionDaoDaoMongodb = new RolePermissionDao(dbEngineMongoDb, null);

const id1 = "313030303030303030303030";
const id2 = "313030303030303030303031";
const id3 = "313030303030303030303032";
const id4 = "313030303030303030303033";

describe("Testing role permission bit name dao update methods", function () {
    [rolePermissionDaoDaoLokijs, rolePermissionDaoDaoMongodb].forEach(function (rolePermissionBitDao) {

        var insertedRecord1;
        var insertedRecord2;

        beforeEach(function (done) {
            rolePermissionBitDao.deleteAll()
                .then(function () {
                    var rolePermissionBit = new RolePermissionBitEntity(id1, id2);
                    var rolePermissionBit2 = new RolePermissionBitEntity(id3, id4);
                    return rolePermissionBitDao.insertMany([rolePermissionBit, rolePermissionBit2])
                })
                .then(function (result) {
                    insertedRecord1 = result[0];
                    insertedRecord2 = result[1];
                    done();
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When updating a record", function () {
            it("The method should always send an error", function (done) {
                insertedRecord1.roleId = id3;
                rolePermissionBitDao.update(insertedRecord1)
                    .then(function (result) {
                        expect.fail("The method should not have updated the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("rolePermissionDao");
                        done();
                    })
            })
        });
    });
});
