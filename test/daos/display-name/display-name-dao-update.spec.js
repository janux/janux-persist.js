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
const newName = "another name";


describe("Testing display name dao update", function () {
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


            describe("When updating a record wit a duplicated name", function () {
                it("The method should return an error", function (done) {
                    insertedRecord1.displayName = name2;
                    displayNameDao.update(insertedRecord1)
                        .then(function (res) {
                            expect.fail("The method should not have updated the record");
                            done();
                        }, function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq("displayName");
                            done();
                        })
                })
            });

            describe("When updating a record with valid values", function () {
                it("It should not send an error", function (done) {
                    insertedRecord1.displayName = newName;
                    displayNameDao.update(insertedRecord1)
                        .then(function (updatedRecord) {
                            expect(updatedRecord.id).eq(insertedRecord1.id);
                            expect(updatedRecord.displayName).eq(newName);
                            return displayNameDao.findOneById(updatedRecord.id);
                        })
                        .then(function (resultQuery) {
                            expect(resultQuery.id).eq(insertedRecord1.id);
                            expect(resultQuery.displayName).eq(newName);
                            done()
                        })
                        .catch(function (err) {
                            expect.fail("Error");
                            done();
                        });
                })
            });

            describe("When updating a record with invalid values", function () {
                it("The method should send an error", function (done) {
                    insertedRecord1.displayName = "     ";
                    displayNameDao.update(insertedRecord1)
                        .then(function (result) {
                            expect.fail("The method should have not updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq("displayName");
                            done();
                        })
                })
            });

            describe("When updating a record without an id", function () {
                it("It should return an error", function (done) {
                    var displayName = new DisplayNameEntity();
                    displayName.displayName = name;
                    displayNameDao.update(displayName)
                        .then(function (res) {
                            expect.fail("The method should not have updated the record");
                            done();
                        }, function (err) {
                            assert("The method sent an error, is ok");
                            done();
                        });
                })
            });

        });
    });
});
