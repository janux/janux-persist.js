/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var mongoose = require('mongoose');

var DisplayNameEntity = require("../../../dist/index").DisplayNameEntity;
var DisplayNameDaoLokijsImpl = require("../../../dist/index").DisplayNameDaoLokijsImpl;
var DisplayNameDaoMongodbImpl = require("../../../dist/index").DisplayNameDaoMongodbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var DisplayNameMongoDbSchema = require("../../../dist/index").DisplayNameMongoDbSchema;

//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath, {throttledSaves: true});
var dbEngineUtilLokijs = new DbEngineUtilLokijs('display-name-test', lokiDatabase);
var displayNameDaoLokijs = new DisplayNameDaoLokijsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('display-name-test', DisplayNameMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var displayNameDaoMongodb = new DisplayNameDaoMongodbImpl(dbEngineMongoDb, null);


const name = "a name";
const name2 = "a different name";


describe("Testing display name dao delete", function () {

    [displayNameDaoMongodb, displayNameDaoLokijs].forEach(function (displayNameDao) {
        describe("Given the inserted records", function () {
            var insertedRecord1;
            var insertedRecord2;

            beforeEach(function (done) {
                displayNameDao.deleteAll()
                    .then(function () {
                        var displayName = new DisplayNameEntity();
                        displayName.displayName = name;
                        var displayName2 = new DisplayNameEntity();
                        displayName2.displayName = name2;
                        return displayNameDao.insertMany([displayName, displayName2]);
                    })
                    .then(function (result) {
                        insertedRecord1 = result[0];
                        insertedRecord2 = result[1];
                        done();
                    })
                    .catch(function (err) {
                        assert.fail(err);
                        done();
                    });
            });

            describe("When calling delete all", function () {
                it("It should delete all records", function (done) {
                    displayNameDao.deleteAll()
                        .then(function () {
                            return displayNameDao.count();
                        })
                        .then(function (count) {
                            expect(count).eq(0);
                            done();
                        });
                });
            });

            describe("When deleting one record", function () {
                it("It should delete it", function (done) {
                    displayNameDao.remove(insertedRecord1)
                        .then(function () {
                            return displayNameDao.count();
                        })
                        .then(function (count) {
                            expect(count).eq(1);
                            done();
                        });
                });
            });

        });
    });

});
