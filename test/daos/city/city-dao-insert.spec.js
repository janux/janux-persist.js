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

describe("Testing country dao insert methods", function () {
    [cityDaoLokijs, cityDaoMongodb].forEach(function (cityDao) {
        beforeEach(function (done) {
            cityDao.deleteAll()
                .then(function () {
                    done()
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When inserting a valid entity", function () {
            it("The entity should exist in the database", function (done) {
                var city = new CityEntity(name, code, idStateProvince);
                cityDao.insert(city)
                    .then(function (result) {
                        expect(result.id).not.to.be.null;
                        expect(result.name).eq(name);
                        expect(result.code).eq(code);
                        expect(result.idStateProvince).eq(idStateProvince);
                        return cityDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.name).eq(name);
                        expect(resultQuery.code).eq(code);
                        expect(resultQuery.idStateProvince).eq(idStateProvince);
                        done();
                    })
            });
        });

        describe("When inserting many records", function () {
            it("The method should have inserted the records", function (done) {
                var city1 = new CityEntity(name, code, idStateProvince);
                var city2 = new CityEntity(name2, code2, idStateProvince2);
                cityDao.insertMany([city1, city2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        expect(result[0].id).not.to.be.null;
                        expect(result[1].id).not.to.be.null;
                        return cityDao.count();
                    })
                    .then(function (count) {
                        expect(count).eq(2);
                        done();
                    })
                    .catch(function (error) {
                        expect.fail("Error");
                        done();
                    })
            })
        });

        describe("When inserting a duplicated record", function () {
            it("The method should return an error", function (done) {
                var city1 = new CityEntity(name, code, idStateProvince);
                cityDao.insert(city1)
                    .then(function (result) {
                        var city2 = new CityEntity(name, code, idStateProvince);
                        return cityDao.insert(city2);
                    })
                    .then(function (result) {
                        expect.fail("The method should have not inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("code");
                        done();
                    });
            });
        });
    });
});
