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


describe("Testing role dao insert", function () {
    [roleDaoLokijs, roleDaoMongodb].forEach(function (roleDao) {
        beforeEach(function (done) {
            roleDao.deleteAll()
                .then(function () {
                    done()
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When inserting a valid entity", function () {
            it("The entity should exits in the database", function (done) {
                var role = new RoleEntity(name, description, true);
                roleDao.insert(role)
                    .then(function (result) {
                        expect(result.id).not.to.be.null;
                        expect(result.name).eq(name);
                        expect(result.description).eq(description);
                        expect(result.enabled).eq(true);
                        return roleDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.name).eq(name);
                        expect(resultQuery.description).eq(description);
                        expect(resultQuery.enabled).eq(true);
                        done();
                    })
            });
        });

        describe("When inserting many records", function () {
            it("The method should have inserted the records", function (done) {
                var role = new RoleEntity(name, description, true);
                var role2 = new RoleEntity(name2, description2, true);
                roleDao.insertMany([role, role2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        expect(result[0].id).not.to.be.null;
                        expect(result[1].id).not.to.be.null;
                        return roleDao.count();
                    })
                    .then(function (count) {
                        expect(count).eq(2);
                        done();
                    })
                    .catch(function (error) {
                        expect.fail("Error");
                        done();
                    })
            })
        });

        describe("When inserting an invalid record", function () {
            it("The method should return an error", function (done) {
                var role = new RoleEntity(name, "   ", true);
                roleDao.insert(role)
                    .then(function (result) {
                        expect.fail("The system should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("description");
                        done();
                    });
            });
        });

        describe("When inserting a duplicated record", function () {
            it("The method should return an error", function (done) {
                var role = new RoleEntity(name, description, true);
                roleDao.insert(role)
                    .then(function (result) {
                        var role2 = new RoleEntity(name, description2, true);
                        return roleDao.insert(role2);
                    })
                    .then(function (result) {
                        expect.fail("The method should have not inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("name");
                        done();
                    });
            });
        });
    })
});

