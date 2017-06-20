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

const idRole1 = "313030303030303030303030";
const idPermissionBit1 = "313030303030303030303031";
const idRole2 = "313030303030303030303032";
const idPermissionBit2 = "313030303030303030303033";
const idRole3 = "313030303030303030303034";
const idPermissionBit3 = "313030303030303030303035";
const invalidId = "313030303030303030303040";

describe("Testing role permission bit name dao find methods", function () {
    [rolePermissionDaoDaoLokijs,rolePermissionDaoDaoMongodb].forEach(function (rolePermissionBitDao) {

        var insertedRecord1;
        var insertedRecord2;

        beforeEach(function (done) {
            rolePermissionBitDao.deleteAll()
                .then(function () {
                    var rolePermissionBit = new RolePermissionBitEntity(idRole1, idPermissionBit1);
                    var rolePermissionBit2 = new RolePermissionBitEntity(idRole2, idPermissionBit2);
                    var rolePermissionBit3 = new RolePermissionBitEntity(idRole3, idPermissionBit3);
                    return rolePermissionBitDao.insertMany([rolePermissionBit, rolePermissionBit2, rolePermissionBit3])
                })
                .then(function (result) {
                    insertedRecord1 = result[0];
                    insertedRecord2 = result[1];
                    done();
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                    done();
                })
        });

        describe("When calling findAllByRoleId ", function () {
            it("It should return one record", function (done) {
                rolePermissionBitDao.findAllByRoleId(idRole2)
                    .then(function (result) {
                        expect(result.length).eq(1);
                        expect(result[0].idRole).eq(idRole2);
                        expect(result[0].idPermissionBit).eq(idPermissionBit2);
                        done();
                    })
            })
        });

        describe("When calling findAllByPermissionBitId ", function () {
            it("It should return one record", function (done) {
                rolePermissionBitDao.findAllByPermissionBitId(idPermissionBit3)
                    .then(function (result) {
                        expect(result.length).eq(1);
                        expect(result[0].idRole).eq(idRole3);
                        expect(result[0].idPermissionBit).eq(idPermissionBit3);
                        done();
                    })
            })
        });

        describe("When calling findAllByRoleIdsIn", function () {
            it("The method should return tow records", function (done) {
                rolePermissionBitDao.findAllByRoleIdsIn([idRole1, idRole2, invalidId])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        expect(result[0].idRole).eq(idRole1);
                        expect(result[1].idRole).eq(idRole2);
                        done();
                    })
            })
        });

        describe("When calling findAllByPermissionBitIdsIn", function () {
            it("The method should return tow records", function (done) {
                rolePermissionBitDao.findAllByPermissionBitIdsIn([idPermissionBit1,idPermissionBit2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        expect(result[0].idRole).eq(idRole1);
                        expect(result[1].idRole).eq(idRole2);
                        done();
                    })
            })
        })
    });
});
