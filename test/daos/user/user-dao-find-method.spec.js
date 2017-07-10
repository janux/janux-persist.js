/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var UserEntity = require("../../../dist/index").UserEntity;
var lokijs = require('lokijs');
var UserDaoLokiJsImpl = require("../../../dist/index").UserDaoLokiJsImpl;
var UserDaoMongodbImpl = require("../../../dist/index").UserDaoMongodbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var UserMongoDbSchema = require("../../../dist/index").UserMongoDbSchema;
var mongoose = require('mongoose');
//Config files
var serverAppContext = config.get("serverAppContext");


const username = "username";
const password = "password";
const username2 = "username2";
const password2 = "password2";
const username3 = "IDoNotExits";
const id = "313030303030303030303030";
const id2 = "313030303030303030303031";
const invalidId = "313030303030303030300000";

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('user-test', lokiDatabase);
var userDaoLokiJsImpl = new UserDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('user-test', UserMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var userDaoMongoDbImpl = new UserDaoMongodbImpl(dbEngineMongoDb, null);

describe("Testing user dao find methods", function () {
    [userDaoLokiJsImpl, userDaoMongoDbImpl].forEach(function (accountDao) {

        describe("Given the inserted records", function () {

            var insertedId;
            var insertedId2;

            before(function (done) {

                accountDao.deleteAll()
                    .then(function () {
                        var account1 = new UserEntity();
                        account1.username = username;
                        account1.password = password;
                        account1.contactId = id;
                        var account2 = new UserEntity();
                        account2.username = username2;
                        account2.password = password2;
                        account2.contactId = id2;
                        return accountDao.insertMany([account1, account2])
                    })
                    .then(function (result) {
                        insertedId = result[0].id;
                        insertedId2 = result[1].id;
                        done();
                    });

            });

            describe("When looking for an username", function () {
                it("It should return one record", function (done) {
                    accountDao.findOneByUserName(username)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            expect(result.username).eq(username);
                            expect(result.password).eq(password);
                            expect(result.contactId).eq(id);
                            done();
                        })
                });
            });

            describe("When looking for an incorrect username", function () {
                it("It should return null", function (done) {
                    accountDao.findOneByUserName(username3)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        })
                });
            });

            describe("When looking for an id in the database", function () {
                it("It should return one record", function (done) {
                    accountDao.findOneById(insertedId)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            done();
                        })
                });
            });

            describe("When looking for an id that doesn't exist in the database", function () {
                it("It should return null", function (done) {
                    accountDao.findOneById(invalidId)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        })
                });
            });

            describe("When looking for several id-s (correct and incorrect)", function () {
                it("It should return an array", function (done) {
                    accountDao.findAllByIds([insertedId, insertedId2])
                        .then(function (result) {
                            expect(result.length).eq(2);
                            done();
                        })
                });

                it("It should return an array with ony one result", function (done) {
                    accountDao.findAllByIds([insertedId, invalidId])
                        .then(function (result) {
                            expect(result.length).eq(1);
                            done();
                        })
                });

                it("It should return an empty array", function (done) {
                    accountDao.findAllByIds([invalidId])
                        .then(function (result) {
                            expect(result.length).eq(0);
                            done();
                        })
                })
            });

            describe("When counting", function () {
                it("Should return 2", function (done) {
                    accountDao.count()
                        .then(function (result) {
                            expect(result).eq(2);
                            done();
                        })
                })
            });

            describe("When calling findOneByContactId", function () {
                it("Should return one record", function (done) {
                    accountDao.findOneByContactId(id2)
                        .then(function (result) {
                            expect(result.contactId).eq(id2);
                            done();
                        })
                })
            });

            describe("When calling findOneByContactId with invalid id", function () {
                it("Should return null", function (done) {
                    accountDao.findOneByContactId(invalidId)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        })
                })
            })
        });
    });
});
