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

const invalidId = "313030303030303030303032";

describe("Testing country dao find methods", function () {
    [countryDaoLokiJsImpl, countryDaoMongoDbImpl].forEach(function (countryDao) {

        var insertedRecord1;
        var insertedRecord2;

        describe("Given the inserted records", function () {
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
                    })
            });

            describe("When calling findAll", function () {
                it("The method should return the records", function (done) {
                    countryDao.findAll()
                        .then(function (result) {
                            expect(result.length).eq(2);
                            done();
                        });
                });
            });

            describe("When calling findOneById", function () {
                it("The method should return a record", function (done) {
                    countryDao.findOneById(insertedRecord1.id)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            expect(result.name).eq(name);
                            done();
                        });
                });
            });

            describe("When calling findOneByIsoCode", function () {
                it("The method should return a record", function (done) {
                    countryDao.findOneByIsoCode(isoCode2)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            expect(result.isoCode).eq(isoCode2);
                            done();
                        });
                });
            });

            describe("When calling findOneById with invalid id", function () {
                it("The method should return null", function (done) {
                    countryDao.findOneById(invalidId)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        });
                });
            })
        });
    });
});
