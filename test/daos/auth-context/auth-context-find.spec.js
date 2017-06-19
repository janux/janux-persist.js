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

var anotherName = "A new name";
const id = "100000000000";


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

            describe("When calling find by name", function () {
                it("The method should return a record", function (done) {
                    authContextDao.findOneByName(name2)
                        .then(function (result) {
                            expect(result.name).eq(name2);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("It should not have returned an error");
                            done();
                        })
                })
            });

            describe("When calling with a name that does not exits in the database", function () {
                it("The method should return a null", function (done) {
                    authContextDao.findOneByName(anotherName)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("It should not have returned an error");
                            done();
                        })
                })
            });


            describe("When calling findAll", function () {
                it("The method should return an array", function (done) {
                    authContextDao.findAll()
                        .then(function (result) {
                            expect(result.length).eq(2);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("It should have returned the records");
                            done();
                        })
                })
            });

            describe("When calling findOneBy", function () {
                it("It should return a record", function (done) {
                    authContextDao.findOneById(insertedRecord1.id)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            expect(result.name).eq(insertedRecord1.name);
                            done();
                        });
                })
            });

            describe("When calling findOneBy with an invalid id", function () {
                it("It should return a record", function (done) {
                    authContextDao.findOneById(id)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        });
                })
            });

            describe("When calling findAllByIds", function () {
                it("It should return an array with one record", function (done) {
                    authContextDao.findAllByIds([insertedRecord1.id, id])
                        .then(function (result) {
                            expect(result.length).eq(1);
                            expect(result[0].id).eq(insertedRecord1.id);
                            done();
                        })
                })
            })
        });
    });
});
