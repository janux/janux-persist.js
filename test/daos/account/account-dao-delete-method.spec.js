/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
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
const id = "313030303030303030303030";


// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('account-test', lokiDatabase);
var accountDaoLokiJsImpl = new AccountDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('account-test', AccountMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var accountDaoMongoDbImpl = new AccountDaoMongoDbImpls(dbEngineMongoDb, null);

describe("Testing account dao delete methods", function () {
    [accountDaoLokiJsImpl, accountDaoMongoDbImpl].forEach(function (accountDao) {
        describe("Given the inserted records", function () {

            var insertedRecord1;
            var insertedRecord2;

            beforeEach(function (done) {
                var account1 = new AccountEntity();
                account1.username = username;
                account1.password = password;
                account1.contactId = id;

                var account2 = new AccountEntity();
                account2.username = username2;
                account2.password = password2;
                account2.contactId = id;
                accountDao.insertMany([account1, account2])
                    .then(function (res) {
                        insertedRecord1 = res[0];
                        insertedRecord2 = res[1];
                        done();
                    })
                    .catch(function (err) {
                        assert.fail("Error", err);
                        done();
                    });
            });

            describe("When calling deleteAll", function () {
                it("It should delete all records", function (done) {
                    accountDao.deleteAll()
                        .then(function () {
                            return accountDao.count();
                        })
                        .then(function (result) {
                            expect(result).eq(0);
                            done();
                        });
                })
            });

            describe("When deleting one record", function () {
                it("It should delete it", function (done) {
                    accountDao.remove(insertedRecord1)
                        .then(function () {
                            return accountDao.count();
                        })
                        .then(function (result) {
                            expect(result).eq(1);
                            done();
                        });
                })
            });

        });
    })
});
