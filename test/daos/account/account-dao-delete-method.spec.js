/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var AccountEntity = require("../../../dist/index").AccountEntity;
var DaoFactory = require("../../../dist/index").DaoFactory;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
//Config files
var serverAppContext = config.get("serverAppContext");


const username = "username";
const password = "password";
const username2 = "username2";
const password2 = "password2";
const id = "313030303030303030303030";
const id2 = "313030303030303030303031";

describe("Testing account dao delete methods", function () {

    [DataSourceHandler.MONGODB, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
        describe("Given the inserted records", function () {

            var insertedRecord1;
            var insertedRecord2;
            var accountDao;
            beforeEach(function (done) {
                var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
                accountDao = DaoFactory.createAccountDao(dbEngine, path);
                var account1 = new AccountEntity();
                account1.username = username;
                account1.password = password;
                account1.contactId = id;

                var account2 = new AccountEntity();
                account2.username = username2;
                account2.password = password2;
                account2.contactId = id2;
                accountDao.insertMany([account1, account2])
                    .then(function (res) {
                        insertedRecord1 = res[0];
                        insertedRecord2 = res[1];
                        done();
                    })

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
