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

const name3 = "United Kingdom";
const isoCode3 = "UK";

describe("Testing country dao update methods", function () {
    [countryDaoLokiJsImpl, countryDaoMongoDbImpl].forEach(function (countryDao) {


        describe("Given the inserted records", function () {

            var insertedRecord1;
            var insertedRecord2;

            beforeEach(function (done) {
                countryDao.deleteAll()
                    .then(function () {
                        var country = new CountryEntity(name, isoCode, phoneCode, sortOrder);
                        var country2 = new CountryEntity(name2, isoCode2, phoneCode, sortOrder);
                        return countryDao.insertMany([country, country2]);
                    })
                    .then(function (result) {
                        insertedRecord1 = result[0];
                        insertedRecord2 = result[1];
                        done();
                    })
                    .catch(function (err) {
                        assert.fail("Error", err);
                        done();
                    })
            });


            describe("When updating with the correct values", function () {
                it("The method should update the record with no problems", function (done) {
                    insertedRecord1.name = name3;
                    insertedRecord1.isoCode = isoCode3;
                    countryDao.update(insertedRecord1)
                        .then(function (result) {
                            expect(result.name).eq(name3);
                            expect(result.isoCode).eq(isoCode3);
                            return countryDao.findOneById(result.id);
                        })
                        .then(function (resultQuery) {
                            expect(resultQuery.name).eq(name3);
                            expect(resultQuery.isoCode).eq(isoCode3);
                            done();
                        })
                })
            });

            describe("When updating the country with an incorrect name", function () {
                it("The method should return an error", function (done) {
                    insertedRecord1.name = name2;
                    countryDao.update(insertedRecord1)
                        .then(function (result) {
                            expect.fail("The method should not have inserted the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq("name");
                            done();
                        })
                })
            });

            describe("When updating the country with an incorrect iso code", function () {
                it("The method should return an error", function (done) {
                    insertedRecord1.isoCode = isoCode2;
                    countryDao.update(insertedRecord1)
                        .then(function (result) {
                            expect.fail("The method should not have inserted the record");
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


    });
});
