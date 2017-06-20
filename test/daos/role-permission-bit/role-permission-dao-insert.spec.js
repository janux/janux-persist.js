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

describe("Testing role permission bit name dao insert methods", function () {
    [rolePermissionDaoDaoLokijs, rolePermissionDaoDaoMongodb].forEach(function (rolePermissionBitDao) {
        beforeEach(function (done) {
            rolePermissionBitDao.deleteAll()
                .then(function () {
                    done()
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });


        describe("When inserting a valid entity", function () {
            it("The entity should exits in the database", function (done) {
                var rolePermissionBit = new RolePermissionBitEntity(id1, id2);
                rolePermissionBitDao.insert(rolePermissionBit)
                    .then(function (result) {
                        expect(result.id).not.to.be.null;
                        expect(result.idRole).eq(id1);
                        expect(result.idPermissionBit).eq(id2);
                        return rolePermissionBitDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.idRole).eq(id1);
                        expect(resultQuery.idPermissionBit).eq(id2);
                        done();
                    })
                    .catch(function (error) {
                        expect.fail("Error");
                        done();
                    });
            });
        });


        describe("When inserting many", function () {
            it("The method should not send an error", function (done) {
                var rolePermissionBit = new RolePermissionBitEntity(id1, id2);
                var rolePermissionBit2 = new RolePermissionBitEntity(id3, id4);
                rolePermissionBitDao.insertMany([rolePermissionBit, rolePermissionBit2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        expect(result[0].id).not.to.be.null;
                        expect(result[1].id).not.to.be.null;
                        return rolePermissionBitDao.findAll();
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.length).eq(2);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail("Error");
                        done();
                    })

            });
        });

        describe("When inserting a duplicated record", function () {
            it("The method should send an error", function (done) {
                var rolePermissionBit = new RolePermissionBitEntity(id1, id2);
                rolePermissionBitDao.insert(rolePermissionBit)
                    .then(function (result) {
                        var rolePermissionBit2 = new RolePermissionBitEntity(id1, id2);
                        return rolePermissionBitDao.insert(rolePermissionBit2)
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("RolePermissionBitEntity");
                        done();
                    });
            });
        });
    });
});
