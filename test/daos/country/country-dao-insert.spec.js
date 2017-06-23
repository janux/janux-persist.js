/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var CountryEntity = require("../../../dist/index").CountryEntity;
var CountryDaoMongoDbImpl = require("../../../dist/index").CountryDaoMongoDbImpl;
var CountryDaoLokiJsImpl = require("../../../dist/index").CountryDaoLokiJsImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var CountryMongoDbSchema = require("../../../dist/index").CountryMongoDbSchema;
var mongoose = require('mongoose');


//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('country-test', lokiDatabase);
var countryDaoLokiJsImpl = new CountryDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('country-test', CountryMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var countryDaoMongoDbImpl = new CountryDaoMongoDbImpl(dbEngineMongoDb, null);

const name = "Mexico";
const isoCode = "MX";
const phoneCode = "52";
const sortOrder = 0;

const name2 = "United Stated";
const isoCode2 = "US";

describe("Testing country dao insert methods", function () {
    [countryDaoLokiJsImpl, countryDaoMongoDbImpl].forEach(function (countryDao) {

        beforeEach(function (done) {
            countryDao.deleteAll()
                .then(function () {
                    done();
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });


        describe("When inserting a valid record", function () {
            it("It should have been inserted correctly", function (done) {
                var country = new CountryEntity(name, isoCode, phoneCode, sortOrder);
                countryDao.insert(country)
                    .then(function (result) {
                        expect(result.id).not.to.be.null;
                        expect(result.name).eq(name);
                        expect(result.phoneCode).eq(phoneCode);
                        expect(result.sortOrder).eq(sortOrder);
                        return countryDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.name).eq(name);
                        expect(resultQuery.phoneCode).eq(phoneCode);
                        expect(resultQuery.isoCode).eq(isoCode);
                        expect(resultQuery.sortOrder).eq(sortOrder);
                        done();
                    });
            });
        });


        describe("When inserting a record with invalid data", function () {
            it("It should return an error", function (done) {
                var country = new CountryEntity(name, "  ", phoneCode, sortOrder);
                countryDao.insert(country)
                    .then(function (result) {
                        expect.fail("The method should have not inerted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("isoCode");
                        done();
                    });
            });
        });


        describe("When inserting a duplicated name", function () {
            it("The method should send an error", function (done) {
                var country = new CountryEntity(name, isoCode, phoneCode, sortOrder);
                countryDao.insert(country)
                    .then(function (result) {
                        var country2 = new CountryEntity(name, isoCode2, phoneCode, sortOrder);
                        countryDao.insert(country2)
                            .then(function (resultInsert2) {
                                expect.fail("The method should have returned an error");
                                done();
                            })
                            .catch(function (err) {
                                expect(err.length).eq(1);
                                expect(err[0].attribute).eq("name");
                                done();
                            })
                    })
            });
        });

        describe("When inserting a duplicated iso code", function () {
            it("The method should send an error", function (done) {
                var country = new CountryEntity(name, isoCode, phoneCode, sortOrder);
                countryDao.insert(country)
                    .then(function (result) {
                        var country2 = new CountryEntity(name2, isoCode, phoneCode, sortOrder);
                        countryDao.insert(country2)
                            .then(function (resultInsert2) {
                                expect.fail("The method should have returned an error");
                                done();
                            })
                            .catch(function (err) {
                                expect(err.length).eq(1);
                                expect(err[0].attribute).eq("isoCode");
                                done();
                            })
                    })
            });
        });

        describe("When inserting many records", function () {
            it("The method should have inserted the records", function (done) {
                var country = new CountryEntity(name, isoCode, phoneCode, sortOrder);
                var country2 = new CountryEntity(name2, isoCode2, phoneCode, sortOrder);
                countryDao.insertMany([country, country2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        return countryDao.count();
                    })
                    .then(function (count) {
                        expect(count).eq(2);
                        done();
                    });
            });
        });
    });
});
