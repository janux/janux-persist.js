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

var AuthContextEntity = require("../../../dist/index").AuthContextEntity;
var AuthContextLokijsImpl = require("../../../dist/index").AuthContextLokijsImpl;
var AuthContextMongoDbImpl = require("../../../dist/index").AuthContextMongoDbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var DisplayNameMongoDbSchema = require("../../../dist/index").AuthContextSchema;

//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath, {throttledSaves: true});
var dbEngineUtilLokijs = new DbEngineUtilLokijs('auth-context-test', lokiDatabase);
var authContextDaoLokijs = new AuthContextLokijsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('auth-context-testt', DisplayNameMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var authContextDaoMongodb = new AuthContextMongoDbImpl(dbEngineMongoDb, null);

var name = "A name";
var description = "A description";
var sortOrder = 1;
var enabled = false;

var name2 = "A name 2";
var description2 = "A description 2";
var sortOrder2 = 2;
var enabled2 = true;

describe("Testing display name dao insert", function () {
    [authContextDaoLokijs, authContextDaoMongodb].forEach(function (authContextDao) {
        beforeEach(function (done) {
            authContextDao.deleteAll()
                .then(function () {
                    done()
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When inserting a valid entity", function () {
            it("The entity should exits in the database", function (done) {
                var auth1 = new AuthContextEntity(name, description, sortOrder, enabled);
                authContextDao.insert(auth1)
                    .then(function (result) {
                        expect(result.id).not.to.be.null;
                        expect(result.name).eq(name);
                        expect(result.description).eq(description);
                        expect(result.sortOrder).eq(sortOrder);
                        expect(result.enabled).eq(enabled);
                        done();
                    })
                    .catch(function (error) {
                        expect.fail("Error");
                        done();
                    });
            });
        });


        describe("When inserting many records", function () {
            it("The method should have inserted the record", function (done) {
                var auth1 = new AuthContextEntity(name, description, sortOrder, enabled);
                var auth2 = new AuthContextEntity(name2, description2, sortOrder2, enabled2);
                authContextDao.insertMany([auth1, auth2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        return authContextDao.findAll();
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
            it("The method should return an error", function (done) {
                var auth1 = new AuthContextEntity(name, description, sortOrder, enabled);
                authContextDao.insert(auth1)
                    .then(function (result) {
                        var auth2 = new AuthContextEntity(name, description, sortOrder, enabled);
                        return authContextDao.insert(auth2)
                    })
                    .then(function (resultInsert) {
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

        describe("When inserting a record with empty description", function () {
            it("The method should return an error", function (done) {
                var auth1 = new AuthContextEntity(name, "   ", sortOrder, enabled);
                authContextDao.insert(auth1)
                    .then(function (result) {
                        expect.fail("The method should have not inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        assert("The method sent an error, is OK");
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("description");
                        done();
                    })
            });
        });

    })
});
