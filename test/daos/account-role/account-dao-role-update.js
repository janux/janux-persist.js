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

describe("Testing account role dao update methods", function () {
    [accountRoleDaoLokiJsImpl, accountRoleDaoMongoDbImpl].forEach(function (accountRoleDao) {

        describe("Given the inserted record", function () {

            var insertedRecord=null;

            beforeEach(function (done) {
                accountRoleDao.deleteAll()
                    .then(function () {
                        var accountRole = new AccountRoleEntity();
                        accountRole.idAccount = id1;
                        accountRole.idRole = id2;
                        return accountRoleDao.insert(accountRole);
                    })
                    .then(function (result) {
                        insertedRecord = result;
                        done();
                    })
                    .catch(function (err) {
                        assert.fail("error", err);
                        done();
                    });
            });

            describe("When updating a record", function () {
                it("The should always send an error",function (done) {
                    insertedRecord.accountId=id3;
                    accountRoleDao.update(insertedRecord)
                        .then(function (result) {
                            assert.fail("The method should not have updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq("accountRole");
                            done();
                        })
                })
            });
        });
    });
});

