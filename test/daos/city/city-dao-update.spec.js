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

var CityEntity = require("../../../dist/index").CityEntity;
var CityDaoLokiJsImpl = require("../../../dist/index").CityDaoLokiJsImpl;
var CityDaoMongoDbImpl = require("../../../dist/index").CityDaoMongoDbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var CityMongoDbSchema = require("../../../dist/index").CityMongoDbSchema;

//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath, {throttledSaves: true});
var dbEngineUtilLokijs = new DbEngineUtilLokijs('city-test', lokiDatabase);
var cityDaoLokijs = new CityDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('city-test', CityMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var cityDaoMongodb = new CityDaoMongoDbImpl(dbEngineMongoDb, null);


const name = "Mexico City";
const code = "CDMX";
const idStateProvince = "313030303030303030303030";

const name2 = "Mexico City 2";
const code2 = "CDMX 2";
const idStateProvince2 = "313030303030303030303031";


const name3 = "Mexico City 3";
const code3 = "CDMX 3";

describe("Testing country dao update methods", function () {
    [cityDaoLokijs, cityDaoMongodb].forEach(function (cityDao) {

        describe("Given the inserted records", function () {

            var insertedRecord1;
            var insertedRecord2;

            beforeEach(function (done) {
                cityDao.deleteAll()
                    .then(function () {
                        var city1 = new CityEntity(name, code, idStateProvince);
                        var city2 = new CityEntity(name2, code2, idStateProvince2);
                        return cityDao.insertMany([city1, city2])
                    })
                    .then(function (result) {
                        insertedRecord1 = result[0];
                        insertedRecord2 = result[1];
                        done();
                    })
                    .catch(function (err) {
                        assert.fail("Error", err);
                    })
            });


            describe("When updating a record with a duplicated code and idStateProvince", function () {
                it("The method should return an error", function (done) {
                    insertedRecord1.code = code2;
                    insertedRecord1.idStateProvince = idStateProvince2;
                    cityDao.update(insertedRecord1)
                        .then(function (result) {
                            expect.fail("The method should have not updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq("code");
                            done();
                        });
                })
            });

            describe("When updating a record with valid values", function () {
                it("It should not send an error", function (done) {
                    insertedRecord1.name = name3;
                    insertedRecord1.code= code3;
                    cityDao.update(insertedRecord1)
                        .then(function (result) {
                            expect(result.name).eq(name3);
                            expect(result.code).eq(code3);
                            expect(result.id).not.to.be.null;
                            return cityDao.findOneById(result.id)
                        })
                        .then(function (resultQuery) {
                            expect(resultQuery.id).eq(insertedRecord1.id);
                            expect(resultQuery.name).eq(name3);
                            expect(resultQuery.code).eq(code3);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("Error");
                            done();
                        });
                });
            });

            describe("When updating a record without an id", function () {
                it("The method should send an error", function (done) {
                    var city1 = new CityEntity(name, code, idStateProvince);
                    cityDao.update(city1)
                        .then(function (result) {
                            expect.fail("The method should not have updated the record");
                            done();
                        })
                        .catch(function (err) {
                            assert("The method sent an error, is OK");
                            done();
                        })
                })
            });
        });
    });
});
