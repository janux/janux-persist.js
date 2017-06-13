/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var Account = require("../../../dist/index").Account;
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

const newPassword = "newPassword";

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

            var insertedAccount1;
            var insertedAccount2;

            beforeEach(function (done) {
                accountDao.deleteAll()
                    .then(function () {
                        var account1 = new Account();
                        account1.username = username;
                        account1.password = password;

                        var account2 = new Account();
                        account2.username = username2;
                        account2.password = password2;
                        return accountDao.insertMany([account1, account2])
                    })
                    .then(function (result) {
                        insertedAccount1 = result[0];
                        insertedAccount2 = result[1];
                        done();
                    });

            });

            describe("When updating a record", function () {
                it("It should not send an error", function (done) {
                    insertedAccount1.password = newPassword;
                    accountDao.update(insertedAccount1)
                        .then(function (res) {
                            //Perform a query with the same id.
                            return accountDao.findOneById(insertedAccount1.id);
                        })
                        .then(function (resultQuery) {
                            expect(resultQuery.id).eq(insertedAccount1.id);
                            expect(resultQuery.password).eq(newPassword);
                            done();
                        });
                })
            });

            describe("When updating a record without an id", function () {
                it("It should return an error", function (done) {
                    var account = new Account;
                    account.username = username;
                    account.password = password;
                    accountDao.update(account)
                        .then(function (res) {
                            assert.fail("The method should not have updated the record");
                            done();
                        }, function (err) {
                            assert("The method sent an error, is ok", err);
                            done();
                        });
                })
            });

            describe("When updating a record with a duplicated username", function () {
                it("It should send an error", function (done) {
                    insertedAccount1.username = username2;
                    accountDao.update(insertedAccount1)
                        .then(function (res) {
                            assert.fail("The method should not have updated the record");
                            done();
                        }, function (err) {
                            assert("The method sent an error, is ok", err);
                            done();
                        });
                })
            })
        });
    })
});
