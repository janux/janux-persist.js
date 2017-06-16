/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
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

const id1 = "313030303030303030303030";
const id2 = "313030303030303030303031";
const id3 = "313030303030303030303032";
const id4 = "313030303030303030303033";


describe("Testing account role dao insert methods", function () {
    [accountRoleDaoLokiJsImpl, accountRoleDaoMongoDbImpl].forEach(function (accountRoleDao) {

        beforeEach(function (done) {
            accountRoleDao.deleteAll()
                .then(function () {
                    done();
                })
                .catch(function (err) {
                    assert.fail("error", err);
                });
        });

        describe("When inserting a record", function () {
            it("The method should not send an error", function (done) {
                var accountRole = new AccountRoleEntity();
                accountRole.idAccount = id1;
                accountRole.idRole = id2;
                accountRoleDao.insert(accountRole)
                    .then(function (result) {
                        expect(result.id).not.to.be.null;
                        expect(result.idAccount).eq(id1);
                        expect(result.idRole).eq(id2);
                        return accountRoleDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.idAccount).eq(id1);
                        expect(resultQuery.idRole).eq(id2);
                        done();
                    })
            });
        });

        describe("When inserting many", function () {
            it("The method should not send an error", function (done) {
                var accountRole = new AccountRoleEntity();
                accountRole.idAccount = id1;
                accountRole.idRole = id2;
                var accountRole2 = new AccountRoleEntity();
                accountRole2.idAccount = id3;
                accountRole2.idRole = id4;
                accountRoleDao.insertMany([accountRole, accountRole2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        expect(result[0].id).not.to.be.null;
                        expect(result[1].id).not.to.be.null;
                        return accountRoleDao.findAll();
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.length).eq(2);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail("Error");
                        done();
                    })
            })
        });

        describe("When inserting a duplicated record", function () {
            it("The method should send an error", function (done) {
                var accountRole = new AccountRoleEntity();
                accountRole.idAccount = id1;
                accountRole.idRole = id2;
                accountRoleDao.insert(accountRole)
                    .then(function (result) {
                        var accountRole2 = new AccountRoleEntity();
                        accountRole2.idAccount = id1;
                        accountRole2.idRole = id2;
                        return accountRoleDao.insert(accountRole2);
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("accountRole");
                        done();
                    });
            });
        });
    });
});
