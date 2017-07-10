/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var UserEntity = require("../../../dist/index").UserEntity;
var lokijs = require('lokijs');
var UserDaoLokiJsImpl = require("../../../dist/index").UserDaoLokiJsImpl;
var UserDaoMongoDbImpl = require("../../../dist/index").UserDaoMongodbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var UserMongoDbSchema = require("../../../dist/index").UserMongoDbSchema;
var mongoose = require('mongoose');
//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('user-test', lokiDatabase);
var userDaoLokiJsImpl = new UserDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('user-test', UserMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var userDaoMongoDbImpl = new UserDaoMongoDbImpl(dbEngineMongoDb, null);

const username = "username";
const password = "password";
const username2 = "username2";
const password2 = "password2";
const id = "313030303030303030303030";
const id2 = "313030303030303030303031";

describe("Testing user dao delete methods", function () {
    [userDaoLokiJsImpl, userDaoMongoDbImpl].forEach(function (accountDao) {
        describe("Given the inserted records", function () {

            var insertedRecord1;
            var insertedRecord2;

            beforeEach(function (done) {
                var account1 = new UserEntity();
                account1.username = username;
                account1.password = password;
                account1.contactId = id;

                var account2 = new UserEntity();
                account2.username = username2;
                account2.password = password2;
                account2.contactId = id2;
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
