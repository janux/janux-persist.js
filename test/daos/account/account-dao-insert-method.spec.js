/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var AccountEntity = require("../../../dist/index").AccountEntity;
var AccountDaoLokiJsImpl = require("../../../dist/index").AccountDaoLokiJsImpl;
var AccountDaoMongoDbImpls = require("../../../dist/index").AccountDaoMongodbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var AccountMongoDbSchema = require("../../../dist/index").AccountMongoDbSchema;
var mongoose = require('mongoose');


//Config files
var serverAppContext = config.get("serverAppContext");



// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('account-test', lokiDatabase);
var accountDaoLokiJsImpl = new AccountDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('account-test', AccountMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var accountDaoMongoDbImpl = new AccountDaoMongoDbImpls(dbEngineMongoDb, null);

const username = "username";
const password = "password";
const username2 = "username2";
const password2 = "password2";
const id = "313030303030303030303030";
const id2 = "313030303030303030303031";

describe("Testing account dao insert methods", function () {
    [accountDaoLokiJsImpl, accountDaoMongoDbImpl].forEach(function (accountDao) {
        beforeEach(function (done) {
            accountDao.deleteAll()
                .then(function () {
                    done();
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When inserting a valid record", function () {
            it("It should have been inserted correctly", function (done) {
                var account = new AccountEntity();
                account.username = username;
                account.password = password;
                account.contactId = id;
                accountDao.insert(account)
                    .then(function (insertedRecord) {
                        //Validate the returned value
                        basicInsertValidation(insertedRecord);
                        //Validate the value is truly inserted
                        accountDao.findOneById(insertedRecord.id)
                            .then(function (resultQuery) {
                                basicInsertValidation(resultQuery);
                                done();
                            })
                    }, function (err) {
                        assert.fail("The method should have inserted the record", err);
                        done();
                    })
                    .catch(function (err) {
                        assert.fail("The method should have inserted the record", err);
                        done();
                    })
            });

            function basicInsertValidation(entity) {
                expect(entity).to.have.property("id");
                expect(entity.username).eq(username);
                expect(entity.password).eq(password);
                expect(entity.contactId).eq(id);
            }
        });

        describe("When inserting a record with a duplicated username", function () {
            it("The method should send an error", function (done) {
                var account = new AccountEntity();
                account.username = username;
                account.password = password;
                account.contactId = id;
                accountDao.insert(account)
                    .then(function (result) {
                        var account2 = new AccountEntity();
                        account2.username = username;
                        account2.password = password;
                        account2.contactId = id2;
                        accountDao.insert(account2)
                            .then(function (result) {
                                assert.fail("The method should not have returned an error");
                                done();
                            }, function (error) {
                                expect(error.length).eq(1);
                                expect(error[0].attribute).eq("username");
                                done();
                            })
                    });
            });
        });

        describe("When inserting a record with a duplicated contactId", function () {
            it("The method should send an error", function (done) {
                var account = new AccountEntity();
                account.username = username;
                account.password = password;
                account.contactId = id;
                accountDao.insert(account)
                    .then(function (result) {
                        var account2 = new AccountEntity();
                        account2.username = username2;
                        account2.password = password2;
                        account2.contactId = id;
                        accountDao.insert(account2)
                            .then(function (result) {
                                assert.fail("The method should not have returned an error");
                                done();
                            }, function (error) {
                                expect(error.length).eq(1);
                                expect(error[0].attribute).eq("contactId");
                                done();
                            })
                    });
            });
        });




        describe("When inserting many records", function () {
            it("The method should have inserted the records", function (done) {
                var account = new AccountEntity();
                account.username = username;
                account.password = password;
                account.contactId = id;
                var account2 = new AccountEntity();
                account2.username = username2;
                account2.password = password2;
                account2.contactId = id;
                accountDao.insertMany([account, account2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        return accountDao.count()
                    })
                    .then(function (resultCount) {
                        expect(resultCount).eq(2);
                        done();
                    });
            });
        });

        describe("When inserting a record that has an id", function () {
            it("It should send an error", function (done) {
                var account = new AccountEntity();
                account.username = username;
                account.password = password;
                account.contactId = id;
                accountDao.insert(account)
                    .then(function (result) {
                        accountDao.insert(result)
                            .then(function (result2) {
                                assert.fail("It should not have inserted the record");
                                done();
                            }, function (err) {
                                assert("The program sent an error, is ok");
                                done();
                            });
                    });
            })
        })
    });
});
