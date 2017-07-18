/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var UserEntity = require("../../../dist/index").AccountEntity;
var lokijs = require('lokijs');
var AccountDaoLokiJsImpl = require("../../../dist/index").AccountDaoLokiJsImpl;
var AccountDaoMongodbImpl = require("../../../dist/index").AccountDaoMongodbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var AccountMongoDbSchema = require("../../../dist/index").AccountMongoDbSchema;
var mongoose = require('mongoose');
//Config files
var serverAppContext = config.get("serverAppContext");


const username = "username";
const password = "password";
const username2 = "username2";
const password2 = "password2";
const username3 = "IDoNotExists";
const id = "313030303030303030303030";
const id2 = "313030303030303030303031";
const invalidId = "313030303030303030300000";

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('user-test', lokiDatabase);
var userDaoLokiJsImpl = new AccountDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('user-test', AccountMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var userDaoMongoDbImpl = new AccountDaoMongodbImpl(dbEngineMongoDb, null);

describe("Testing user dao find methods", function () {
    [userDaoLokiJsImpl, userDaoMongoDbImpl].forEach(function (userDao) {

        describe("Given the inserted records", function () {

            var insertedId;
            var insertedId2;

            before(function (done) {

                userDao.deleteAll()
                    .then(function () {
                        var account1 = new UserEntity();
                        account1.username = username;
                        account1.password = password;
                        account1.contactId = id;
                        var account2 = new UserEntity();
                        account2.username = username2;
                        account2.password = password2;
                        account2.contactId = id2;
                        return userDao.insertMany([account1, account2])
                    })
                    .then(function (result) {
                        insertedId = result[0].id;
                        insertedId2 = result[1].id;
                        done();
                    });

            });

            describe("When looking for an username", function () {
                it("It should return one record", function (done) {
                    userDao.findAllByUserNameMatch(username)
                        .then(function (result) {
                            expect(result.length).eq(2);
                            expect(result[0].username).eq(username);
                            expect(result[0].password).eq(password);
                            expect(result[0].contactId).eq(id);
                            done();
                        })
                });
            });
            describe("When looking for one username", function () {
                it("It should return one record", function (done) {
                    userDao.findOneByUserName(username)
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
                    userDao.findAllByUserNameMatch(username3)
                        .then(function (result) {
                            expect(result.length).eq(0);
                            done();
                        })
                });
            });

            describe("When looking for an id in the database", function () {
                it("It should return one record", function (done) {
                    userDao.findOneById(insertedId)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            done();
                        })
                });
            });

            describe("When looking for an id that doesn't exist in the database", function () {
                it("It should return null", function (done) {
                    userDao.findOneById(invalidId)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        })
                });
            });

            describe("When looking for several id-s (correct and incorrect)", function () {
                it("It should return an array", function (done) {
                    userDao.findAllByIds([insertedId, insertedId2])
                        .then(function (result) {
                            expect(result.length).eq(2);
                            done();
                        })
                });

                it("It should return an array with ony one result", function (done) {
                    userDao.findAllByIds([insertedId, invalidId])
                        .then(function (result) {
                            expect(result.length).eq(1);
                            done();
                        })
                });

                it("It should return an empty array", function (done) {
                    userDao.findAllByIds([invalidId])
                        .then(function (result) {
                            expect(result.length).eq(0);
                            done();
                        })
                })
            });

            describe("When counting", function () {
                it("Should return 2", function (done) {
                    userDao.count()
                        .then(function (result) {
                            expect(result).eq(2);
                            done();
                        })
                })
            });

            describe("When calling findOneByContactId", function () {
                it("Should return one record", function (done) {
                    userDao.findOneByContactId(id2)
                        .then(function (result) {
                            expect(result.contactId).eq(id2);
                            done();
                        })
                })
            });

            describe("When calling findOneByContactId with invalid id", function () {
                it("Should return null", function (done) {
                    userDao.findOneByContactId(invalidId)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        })
                })
            })
        });
    });
});
