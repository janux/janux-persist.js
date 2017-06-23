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

describe("Testing country dao delete methods", function () {
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

            describe("When calling delete all", function () {
                it("It should delete all records", function (done) {
                    cityDao.deleteAll()
                        .then(function () {
                            return cityDao.count();
                        })
                        .then(function (count) {
                            expect(count).eq(0);
                            done();
                        });
                });
            });

            describe("When deleting one record", function () {
                it("It should delete it", function (done) {
                    cityDao.remove(insertedRecord1)
                        .then(function () {
                            return cityDao.count();
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
