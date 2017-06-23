/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var mongoose = require('mongoose');

var StateProvinceEntity = require("../../../dist/index").StateProvinceEntity;
var StateProvinceDaoMongoDbImpl = require("../../../dist/index").StateProvinceDaoMongoDbImpl;
var StateProvinceDaoLokiJsImpl = require("../../../dist/index").StateProvinceDaoLokiJsImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var StateProvinceMongoDbSchema = require("../../../dist/index").StateProvinceMongoDbSchema;

//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath, {throttledSaves: true});
var dbEngineUtilLokijs = new DbEngineUtilLokijs('state-province-test', lokiDatabase);
var stateProvinceDaoLokijs = new StateProvinceDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('state-province-test', StateProvinceMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var stateProvinceDaoMongoDbImpl = new StateProvinceDaoMongoDbImpl(dbEngineMongoDb, null);

const id = "313030303030303030303030";
const id2 = "313030303030303030303031";
const id3 = "313030303030303030303032";

var code = "CDMX";
var name = "Mexico city";
var sortOrder = 1;

var code2 = "CDMX2";
var name2 = "Mexico city 2";
var sortOrder2 = 2;

describe("Testing state province find methods", function () {
    [stateProvinceDaoLokijs, stateProvinceDaoMongoDbImpl].forEach(function (stateProvinceDao) {

        var insertedRecord1;
        var insertedRecord2;

        beforeEach(function (done) {
            stateProvinceDao.deleteAll()
                .then(function () {
                    var stateProvince = new StateProvinceEntity(name, code, id, sortOrder);
                    var stateProvince2 = new StateProvinceEntity(name2, code2, id2, sortOrder2);
                    return stateProvinceDao.insertMany([stateProvince, stateProvince2])
                })
                .then(function (insertedRecords) {
                    insertedRecord1 = insertedRecords[0];
                    insertedRecord2 = insertedRecords[1];
                    done();
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When calling findAllByIdCountry", function () {
            it("The method should return the record", function (done) {
                stateProvinceDao.findAllByIdCountry(id)
                    .then(function (result) {
                        expect(result.length).eq(1);
                        expect(result[0].name).eq(name);
                        done();
                    });
            });
        });

        describe("When calling findAllByIdCountry with an id that does no exist in the database", function () {
            it("The method should return an empty array", function (done) {
                stateProvinceDao.findAllByIdCountry(id3)
                    .then(function (result) {
                        expect(result.length).eq(0);
                        done();
                    });
            });
        });

        describe("When calling findAll", function () {
            it("The method should return an array", function (done) {
                stateProvinceDao.findAll()
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

        describe("When calling findOneById", function () {
            it("It should return a record", function (done) {
                stateProvinceDao.findOneById(insertedRecord1.id)
                    .then(function (result) {
                        expect(result).not.to.be.null;
                        expect(result.name).eq(insertedRecord1.name);
                        done();
                    });
            })
        });

        describe("When calling findOneBy with an invalid id", function () {
            it("It should return a null", function (done) {
                stateProvinceDao.findOneById(id3)
                    .then(function (result) {
                        expect(result).to.be.null;
                        done();
                    });
            })
        });
    });
});
