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

const id1 = "313030303030303030303030";
const id2 = "313030303030303030303031";
const id3 = "313030303030303030303032";
const id4 = "313030303030303030303033";


describe("Testing user role dao delete methods", function () {
    [userRoleDaoLokiJsImpl, userRoleDaoMongoDbImpl].forEach(function (accountRoleDao) {
        describe("Given the inserted record", function () {
            var insertedRecord = null;
            var insertedRecord2 = null;

            beforeEach(function (done) {
                accountRoleDao.deleteAll()
                    .then(function () {
                        var accountRole = new UserRoleEntity();
                        accountRole.idAccount = id1;
                        accountRole.idRole = id2;
                        var accountRole2 = new UserRoleEntity();
                        accountRole2.idAccount = id3;
                        accountRole2.idRole = id4;
                        return accountRoleDao.insertMany([accountRole, accountRole2]);
                    })
                    .then(function (result) {
                        insertedRecord = result[0];
                        insertedRecord2 = result[1];
                        done();
                    })
                    .catch(function (err) {
                        assert.fail("error", err);
                        done();
                    });
            });


            describe("When deleting all record", function () {
                it("The method should not return an error", function (done) {
                    accountRoleDao.deleteAll()
                        .then(function () {
                            accountRoleDao.count()
                                .then(function (result) {
                                    expect(result).eq(0);
                                    done();
                                })
                        })
                        .catch(function (err) {
                            expect.fail("The system should not have returned an error");
                            done();
                        });
                })
            });


            describe("When deleting one record", function () {
                it("The method should not return an error", function (done) {
                    accountRoleDao.remove(insertedRecord)
                        .then(function () {
                            return accountRoleDao.count();
                        })
                        .then(function (resultCount) {
                            expect(resultCount).eq(1);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("The system should not have returned an error");
                            done();
                        });
                })
            });
        });
    });
});
