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

const countryIsoCode1 = "MX";
var code = "CDMX";
var name = "Mexico city";
var sortOrder = 1;

var code2 = "CDMX2";
var name2 = "Mexico city 2";
var sortOrder2 = 2;
const countryIsoCode2 = "USA";

var code3 = "CDMX3";
var name3 = "Mexico city 3";
var sortOrder3 = 3;

describe("Testing state province update methods", function () {
    [stateProvinceDaoMongoDbImpl, stateProvinceDaoLokijs].forEach(function (stateProvinceDao) {

        var insertedRecord1;
        var insertedRecord2;

        beforeEach(function (done) {
            stateProvinceDao.deleteAll()
                .then(function () {
                    var stateProvince = new StateProvinceEntity(name, code, countryIsoCode1, sortOrder);
                    var stateProvince2 = new StateProvinceEntity(name2, code2, countryIsoCode2, sortOrder2);
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

        describe("When updating a record with valid values", function () {
            it("It should not send an error", function (done) {
                insertedRecord1.name = name3;
                insertedRecord1.code = code3;
                insertedRecord1.sortOrder = sortOrder3;
                insertedRecord1.countryIsoCode = countryIsoCode2;
                stateProvinceDao.update(insertedRecord1)
                    .then(function (resultUpdate) {
                        expect(resultUpdate.id).not.to.be.null;
                        expect(resultUpdate.name).eq(name3);
                        expect(resultUpdate.code).eq(code3);
                        expect(resultUpdate.sortOrder).eq(sortOrder3);
                        expect(resultUpdate.countryIsoCode).eq(countryIsoCode2);
                        return stateProvinceDao.findOneById(resultUpdate.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.id).not.to.be.null;
                        expect(resultQuery.name).eq(name3);
                        expect(resultQuery.code).eq(code3);
                        expect(resultQuery.sortOrder).eq(sortOrder3);
                        expect(resultQuery.countryIsoCode).eq(countryIsoCode2);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail("Error");
                        done();
                    });
            });
        });

        describe("When updating a record with invalid values", function () {
            it("It should send an error", function (done) {
                insertedRecord1.name = "   ";
                stateProvinceDao.update(insertedRecord1)
                    .then(function (resultUpdate) {
                        expect.fail("The method should not have updated the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("name");
                        done();
                    });
            });
        });

        describe("When updating the code and countryIsoCode in order to have a duplicated pair", function () {
            it("The method should return an error", function (done) {
                insertedRecord1.code = code2;
                insertedRecord1.countryIsoCode = countryIsoCode2;
                stateProvinceDao.update(insertedRecord1)
                    .then(function (resultUpdate) {
                        expect.fail("The method should not have updated the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("code");
                        done();
                    });
            })
        });
    });
});
