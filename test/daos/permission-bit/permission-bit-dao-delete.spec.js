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

describe("Testing permission bit delete methods", function () {

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

        describe("When calling delete all", function () {
            it("It should delete all records", function (done) {
                permissionBitDao.deleteAll()
                    .then(function () {
                        return permissionBitDao.count();
                    })
                    .then(function (count) {
                        expect(count).eq(0);
                        done();
                    });
            });
        });

        describe("When deleting one record", function () {
            it("It should delete it", function (done) {
                permissionBitDao.remove(insertedRecord1)
                    .then(function () {
                        return permissionBitDao.count();
                    })
                    .then(function (count) {
                        expect(count).eq(2);
                        done();
                    });
            });
        });



    });
});
