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
const name2 = "a name 2";

describe("Testing display name dao insert", function () {

    [displayNameDaoLokijs, displayNameDaoMongodb].forEach(function (displayNameDao) {

        beforeEach(function (done) {
            displayNameDao.deleteAll()
                .then(function () {
                    done()
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });


        describe("When inserting a valid entity", function () {
            it("The entity should exits in the database", function (done) {
                var displayName = new DisplayNameEntity();
                displayName.displayName = name;
                displayNameDao.insert(displayName)
                    .then(function (resultInsert) {
                        expect(resultInsert.displayName).eq(name);
                        expect(resultInsert.id).not.to.be.null;
                        displayNameDao.findOneById(resultInsert.id)
                            .then(function (queryResult) {
                                expect(queryResult.id).eq(resultInsert.id);
                                expect(queryResult.displayName).eq(name);
                                done();
                            })
                            .catch(function (err) {
                                expect.fail("It should have queried the database");
                                done();
                            });
                    })
                    .catch(function (err) {
                        expect.fail(("It should have inserted the record"));
                        done();
                    })
            });
        });

        describe("When inserting many records", function () {
            it("The method should have inserted the record", function (done) {
                var displayName = new DisplayNameEntity();
                displayName.displayName = name;
                var displayName2 = new DisplayNameEntity();
                displayName2.displayName = name2;
                displayNameDao.insertMany([displayName, displayName2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        displayNameDao.findAll()
                            .then(function (resultFindAll) {
                                expect(resultFindAll.length).eq(2);
                                done();
                            })
                            .catch(function (err) {
                                expect.fail("The method should have returned the records");
                                done();
                            })
                    })
                    .catch(function (err) {
                        expect.fail("It should have inserted the records");
                        done();
                    })
            });
        });

        describe("When inserting a duplicated record", function () {
            it("The method should return an error", function (done) {
                var displayName = new DisplayNameEntity();
                displayName.displayName = name;
                displayNameDao.insert(displayName)
                    .then(function (result) {
                        var displayNameDuplicated = new DisplayNameEntity();
                        displayNameDuplicated.displayName = name;
                        return displayNameDao.insert(displayNameDuplicated);
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("displayName");
                        done();
                    });
            })
        });

        describe("When inserting a record with empty name", function () {
            it("The method should return an error", function (done) {
                var displayName = new DisplayNameEntity();
                displayName.displayName = "     ";
                displayNameDao.insert(displayName)
                    .then(function (result) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        assert("The method sent an error, is Ok");
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("displayName");
                        done();
                    });
            });
        });

    })
});



