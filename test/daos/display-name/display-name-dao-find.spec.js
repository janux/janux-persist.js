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
const anotherName = "another name";
const id = "100000000000";


describe("Testing display name dao find", function () {

    [displayNameDaoLokijs, displayNameDaoMongodb].forEach(function (displayNameDao) {

        var insertedRecord1;
        var insertedRecord2;

        describe("Given the inserted records", function () {
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
                        assert.fail("error", err);
                        done();
                    });
            });

            describe("When calling find by name", function () {
                it("The method should return a record", function (done) {
                    displayNameDao.findOneByName(name2)
                        .then(function (result) {
                            expect(result.displayName).eq(name2);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("It should not have returned an error");
                            done();
                        })
                })
            });

            describe("When calling with a name that does not exits in the database", function () {
                it("The method should return a null", function (done) {
                    displayNameDao.findOneByName(anotherName)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("It should not have returned an error");
                            done();
                        })
                })
            });

            describe("When calling findAll", function () {
                it("The method should return an array", function (done) {
                    displayNameDao.findAll()
                        .then(function (result) {
                            expect(result.length).eq(2);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("It should have returned the records");
                            done();
                        })
                })
            });


            describe("When calling findOneBy", function () {
                it("It should return a record", function (done) {
                    displayNameDao.findOneById(insertedRecord1.id)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            expect(result.displayName).eq(insertedRecord1.displayName);
                            done();
                        });
                })
            });

            describe("When calling findOneBy with an invalid id", function () {
                it("It should return a record", function (done) {
                    displayNameDao.findOneById(id)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        });
                })
            });

            describe("When calling findAllByIds",function () {
                it("It should return an array with one record",function (done) {
                    displayNameDao.findAllByIds([insertedRecord1.id,id])
                        .then(function (result) {
                            expect(result.length).eq(1);
                            expect(result[0].id).eq(insertedRecord1.id);
                            done();
                        })
                })
            })
        });
    })
});
