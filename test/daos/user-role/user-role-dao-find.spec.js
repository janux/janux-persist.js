/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var UserRoleEntity = require("../../../dist/index").UserRoleEntity;
var lokijs = require('lokijs');
var UserRoleDao = require("../../../dist/index").UserRoleDao;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var UserRoleMongoDbSchema = require("../../../dist/index").UserRoleMongoDbSchema;
var mongoose = require('mongoose');
//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('user-role-test', lokiDatabase);
var userRoleDaoLokiJsImpl = new UserRoleDao(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('user-role-test', UserRoleMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var userRoleDaoMongoDbImpl = new UserRoleDao(dbEngineMongoDb, null);

const idAccount1 = "313030303030303030303030";
const idRole1 = "313030303030303030303031";
const idAccount2 = "313030303030303030303032";
const idRole2 = "313030303030303030303033";

describe("Testing user role dao find methods", function () {
    [userRoleDaoLokiJsImpl, userRoleDaoMongoDbImpl].forEach(function (accountRoleDao) {
        describe("Given the inserted record", function () {

            beforeEach(function (done) {
                accountRoleDao.deleteAll()
                    .then(function () {
                        var accountRole = new UserRoleEntity();
                        accountRole.idAccount = idAccount1;
                        accountRole.idRole = idRole1;
                        var accountRole2 = new UserRoleEntity();
                        accountRole2.idAccount = idAccount1;
                        accountRole2.idRole = idRole2;

                        var accountRole3 = new UserRoleEntity();
                        accountRole3.idAccount = idAccount2;
                        accountRole3.idRole = idRole1;
                        var accountRole4 = new UserRoleEntity();
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
