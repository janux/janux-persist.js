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
describe("Testing auth context dao find methods", function () {
    [authContextDaoLokijs, authContextDaoMongodb].forEach(function (authContextDao) {
        describe("Given the inserted records", function () {

            var insertedRecord1;
            var insertedRecord2;

            beforeEach(function (done) {

                authContextDao.deleteAll()
                    .then(function () {
                        var auth1 = new AuthContextEntity(name, description, sortOrder, enabled);
                        var auth2 = new AuthContextEntity(name2, description2, sortOrder2, enabled2);
                        authContextDao.insertMany([auth1, auth2])
                            .then(function (res) {
                                insertedRecord1 = res[0];
                                insertedRecord2 = res[1];
                                done();
                            })
                            .catch(function (err) {
                                assert.fail("err");
                                done();
                            });
                    });
            });

            describe("When calling delete all", function () {
                it("It should delete all records", function (done) {
                    authContextDao.deleteAll()
                        .then(function () {
                            return authContextDao.count();
                        })
                        .then(function (count) {
                            expect(count).eq(0);
                            done();
                        });
                });
            });

            describe("When deleting one record", function () {
                it("It should delete it", function (done) {
                    authContextDao.remove(insertedRecord1)
                        .then(function () {
                            return authContextDao.count();
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
