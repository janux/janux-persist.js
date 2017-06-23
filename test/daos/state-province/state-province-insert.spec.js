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
var code = "CDMX";
var name = "Mexico city";
var sortOrder = 1;

var code2 = "CDMX2";
var name2 = "Mexico city 2";
var sortOrder2 = 2;

describe("Testing state province insert methods", function () {
    [stateProvinceDaoLokijs, stateProvinceDaoMongoDbImpl].forEach(function (stateProvinceDao) {
        beforeEach(function (done) {
            stateProvinceDao.deleteAll()
                .then(function () {
                    done()
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });


        describe("When inserting a valid entity", function () {
            it("The entity should exits in the database", function (done) {
                var stateProvince = new StateProvinceEntity(name, code, id, sortOrder);
                stateProvinceDao.insert(stateProvince)
                    .then(function (resultInsert) {
                        expect(resultInsert.id).not.to.be.null;
                        expect(resultInsert.name).eq(name);
                        expect(resultInsert.code).eq(code);
                        expect(resultInsert.idCountry).eq(id);
                        expect(resultInsert.sortOrder).eq(sortOrder);
                        return stateProvinceDao.findOneById(resultInsert.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.id).not.to.be.null;
                        expect(resultQuery.name).eq(name);
                        expect(resultQuery.code).eq(code);
                        expect(resultQuery.idCountry).eq(id);
                        expect(resultQuery.sortOrder).eq(sortOrder);
                        done();
                    });
            });
        });

        describe("When inserting many", function () {
            it("The method should not send an error", function (done) {
                var stateProvince = new StateProvinceEntity(name, code, id, sortOrder);
                var stateProvince2 = new StateProvinceEntity(name2, code2, id, sortOrder2);
                stateProvinceDao.insertMany([stateProvince, stateProvince2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        expect(result[0].id).not.to.be.null;
                        expect(result[1].id).not.to.be.null;
                        return stateProvinceDao.findAll();
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.length).eq(2);
                        expect(resultQuery[0].id).not.to.be.null;
                        expect(resultQuery[1].id).not.to.be.null;
                        done();
                    })
            })
        });

        describe("When inserting a record with a duplicated code with the same countryId", function () {
            it("The method should return an error", function (done) {
                var stateProvince = new StateProvinceEntity(name, code, id, sortOrder);
                stateProvinceDao.insert(stateProvince)
                    .then(function (result) {
                        return stateProvinceDao.insert(new StateProvinceEntity(name, code, id, sortOrder))
                    })
                    .then(function (result) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("code");
                        done();
                    })
            });
        });

        describe("When inserting a record with a duplicated code with different countryId", function () {
            it("The method should not return an error", function (done) {
                var stateProvince = new StateProvinceEntity(name, code, id, sortOrder);
                stateProvinceDao.insert(stateProvince)
                    .then(function (result) {
                        return stateProvinceDao.insert(new StateProvinceEntity(name, code, id2, sortOrder))
                    })
                    .then(function (result) {
                        done();
                    })
                    .catch(function (err) {
                        expect.fail("The method should not have sent an error");
                        done();
                    })
            });
        });
    });
});
