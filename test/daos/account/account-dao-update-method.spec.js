/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var AccountEntity = require("../../../lib/index").AccountEntity;
var DaoFactory = require("../../../lib/index").DaoFactory;
var DataSourceHandler = require("../../../lib/index").DataSourceHandler;

const username = "username";
const password = "password";
const username2 = "username2";
const password2 = "password2";
const id = "313030303030303030303030";
const id2 = "313030303030303030303031";

const newPassword = "newPassword";

//Config files
var serverAppContext = config.get("serverAppContext");

describe("Testing user dao update methods", function () {
    [DataSourceHandler.LOKIJS, DataSourceHandler.MONGODB].forEach(function (dbEngine) {

        describe("Given the inserted records", function () {
            var accountDao;
            var insertedRecord1;
            var insertedRecord2;

            beforeEach(function (done) {
                var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
                accountDao = DaoFactory.createAccountDao(dbEngine, path);
                accountDao.deleteAll()
                    .then(function () {
                        var account1 = new AccountEntity();
                        account1.username = username;
                        account1.password = password;
                        account1.contactId = id;
                        var account2 = new AccountEntity();
                        account2.username = username2;
                        account2.password = password2;
                        account2.contactId = id2;
                        return accountDao.insertMany([account1, account2])
                    })
                    .then(function (result) {
                        insertedRecord1 = result[0];
                        insertedRecord2 = result[1];
                        done();
                    });

            });

            describe("When updating a record", function () {
                it("It should not send an error", function (done) {
                    insertedRecord1.password = newPassword;
                    accountDao.update(insertedRecord1)
                        .then(function (res) {
                            //Perform a query with the same id.
                            return accountDao.findOneById(insertedRecord1.id);
                        })
                        .then(function (resultQuery) {
                            expect(resultQuery.id).eq(insertedRecord1.id);
                            expect(resultQuery.password).eq(newPassword);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("Error");
                            done();
                        });
                })
            });

            describe("When updating a record without an id", function () {
                it("It should return an error", function (done) {
                    var account = new AccountEntity;
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
                    insertedRecord1.username = username2;
                    accountDao.update(insertedRecord1)
                        .then(function (res) {
                            assert.fail("The method should not have updated the record");
                            done();
                        }, function (err) {
                            assert("The method sent an error, is ok", err);
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq("username");
                            done();
                        });
                })
            });

            describe("When updating a record with a duplicated contactId", function () {
                it("It should send an error", function (done) {
                    insertedRecord1.contactId = id2;
                    accountDao.update(insertedRecord1)
                        .then(function (res) {
                            assert.fail("The method should not have updated the record");
                            done();
                        }, function (err) {
                            assert("The method sent an error, is ok", err);
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq("contactId");
                            done();
                        });
                })
            })
        });
    })
});
