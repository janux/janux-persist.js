/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var AccountRoleEntity = require("../../../dist/index").AccountRoleEntity;
var lokijs = require('lokijs');
var AccountRoleDao = require("../../../dist/index").AccountRoleDao;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var AccountRoleMongoDbSchema = require("../../../dist/index").AccountRoleMongoDbSchema;
var mongoose = require('mongoose');
//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('account-role-test', lokiDatabase);
var accountRoleDaoLokiJsImpl = new AccountRoleDao(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('account-role-test', AccountRoleMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var accountRoleDaoMongoDbImpl = new AccountRoleDao(dbEngineMongoDb, null);

const idAccount1 = "313030303030303030303030";
const idRole1 = "313030303030303030303031";
const idAccount2 = "313030303030303030303032";
const idRole2 = "313030303030303030303033";

describe("Testing account role dao find methods", function () {
    [accountRoleDaoLokiJsImpl, accountRoleDaoMongoDbImpl].forEach(function (accountRoleDao) {
        describe("Given the inserted record", function () {

            beforeEach(function (done) {
                accountRoleDao.deleteAll()
                    .then(function () {
                        var accountRole = new AccountRoleEntity();
                        accountRole.idAccount = idAccount1;
                        accountRole.idRole = idRole1;
                        var accountRole2 = new AccountRoleEntity();
                        accountRole2.idAccount = idAccount1;
                        accountRole2.idRole = idRole2;

                        var accountRole3 = new AccountRoleEntity();
                        accountRole3.idAccount = idAccount2;
                        accountRole3.idRole = idRole1;
                        var accountRole4 = new AccountRoleEntity();
                        accountRole4.idAccount = idAccount2;
                        accountRole4.idRole = idRole2;

                        return accountRoleDao.insertMany([accountRole, accountRole2, accountRole3, accountRole4]);
                    })
                    .then(function () {
                        done();
                    })
                    .catch(function (err) {
                        assert.fail("error", err);
                        done();
                    });
            });


            describe("When calling findAllByAccountId", function () {
                it("It should return 2 results", function (done) {
                    accountRoleDao.findAllByAccountId(idAccount1)
                        .then(function (result) {
                            expect(result.length).eq(2);
                            expect(result[0].idAccount).eq(idAccount1);
                            expect(result[1].idAccount).eq(idAccount1);
                            done();
                        })
                });
            });

            describe("When calling findAllByRoleId", function () {
                it("It should return 2 results", function (done) {
                    accountRoleDao.findAllByRoleId(idRole1)
                        .then(function (result) {
                            expect(result.length).eq(2);
                            expect(result[0].idRole).eq(idRole1);
                            expect(result[1].idRole).eq(idRole1);
                            done();
                        })
                });
            });

            describe("When calling findAllByAccountIdAndRoleId", function () {
                it("It should return only one record", function (done) {
                    accountRoleDao.findAllByAccountIdAndRoleId(idAccount1, idRole1)
                        .then(function (result) {
                            expect(result.length).eq(1);
                            done();
                        });
                });
            })
        });
    });
});
