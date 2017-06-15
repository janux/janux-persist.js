/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var AccountEntity = require("../../../dist/index").AccountEntity;
var lokijs = require('lokijs');
var AccountDaoLokiJsImpl = require("../../../dist/index").AccountDaoLokiJsImpl;
var AccountDaoMongoDbImpls = require("../../../dist/index").AccountDaoMongodbImpl;
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
const username3 = "IDoNotExits";
const id = "313030303030303030303030";
const invalidId = "313030303030303030300000";

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('account-test', lokiDatabase);
var accountDaoLokiJsImpl = new AccountDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('account-test', AccountMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var accountDaoMongoDbImpl = new AccountDaoMongoDbImpls(dbEngineMongoDb, null);

describe("Testing account dao find methods", function () {
    [accountDaoLokiJsImpl, accountDaoMongoDbImpl].forEach(function (accountDao) {

        describe("Given the inserted records", function () {

            var insertedId;
            var insertedId2;

            before(function (done) {

                accountDao.deleteAll()
                    .then(function () {
                        var account1 = new AccountEntity();
                        account1.username = username;
                        account1.password = password;
                        account1.contactId = id;
                        var account2 = new AccountEntity();
                        account2.username = username2;
                        account2.password = password2;
                        account2.contactId = id;
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

            describe("When calling findAll", function () {
                it("Should return all records", function (done) {
                    accountDao.findAll()
                        .then(function (result) {
                            expect(result.length).eq(2);
                            done();
                        })
                })
            })
        });
    });
});
