/**
 * Project janux-persistence
 * Created by ernesto on 6/23/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var mongoose = require('mongoose');

var PartyValidator = require("../../../dist/index").PartyValidator;
var PersonEntity = require("janux-people").Person;
var OrganizationEntity = require("janux-people").Organization;
var DaoFactory = require("../../../dist/index").DaoFactory;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");


const firstName = "John";
const middleName = "Doe";
const lastName = "Iglesias";
const honorificPrefix = "honorificPrefix";
const honorificSuffix = "honorificSuffix";
const work = "work";
const home = "home";

const organizationName = "Glarus";
const organizationName2 = "Glarus 2";

const name2 = "Jane";
const middleName2 = "Smith";


var invalidId1 = "313030303030303030303030";
var invalidId2 = "313030303030303030303032";

describe("Testing party dao find methods", function () {
    [DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
        describe("Given the inserted records", function () {
            var partyDao
            var insertedRecordOrganization;
            var insertedRecordPerson;
            var insertedRecordOrganization2;
            var insertedRecordPerson2;

            beforeEach(function (done) {
                var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
                partyDao = DaoFactory.createPartyDao(dbEngine, path);
                partyDao.removeAll()
                    .then(function () {

                        var organization = new OrganizationEntity();
                        organization.name = organizationName;

                        var person = new PersonEntity();
                        person.name.first = firstName;
                        person.name.middle = middleName;
                        person.name.last = lastName;

                        var organization2 = new OrganizationEntity();
                        organization2.name = organizationName2;

                        var person2 = new PersonEntity();
                        person2.name.first = name2;
                        person2.name.middle = middleName2;

                        return partyDao.insertMany([organization, person, organization2, person2])
                    })
                    .then(function (result) {
                        insertedRecordOrganization = result[0];
                        insertedRecordPerson = result[1];
                        insertedRecordOrganization2 = result[2];
                        insertedRecordPerson2 = result[3];
                        done();
                    })
                    .catch(function (err) {
                        assert.fail("Error", err);
                        done();
                    })
            });


            describe("When calling findPeople", function () {
                it("The method should return 2 records", function (done) {
                    partyDao.findPeople()
                        .then(function (result) {
                            expect(result.length).eq(2);
                            expect(result[0].id).not.to.be.undefined;
                            expect(result[0].typeName).eq(PartyValidator.PERSON);
                            expect(result[1].id).not.to.be.undefined;
                            expect(result[1].typeName).eq(PartyValidator.PERSON);
                            done();
                        });
                })
            });

            describe("When calling findOrganizations", function () {
                it("The method should return 2 records", function (done) {
                    partyDao.findOrganizations()
                        .then(function (result) {
                            expect(result.length).eq(2);
                            expect(result[0].typeName).eq(PartyValidator.ORGANIZATION);
                            expect(result[1].typeName).eq(PartyValidator.ORGANIZATION);
                            done();
                        });
                })
            });

            describe("When calling the method findByIds", function () {
                it("The method should return one record", function (done) {
                    partyDao.findByIds([invalidId1, invalidId2, insertedRecordOrganization2.id])
                        .then(function (result) {
                            expect(result.length).eq(1);
                            done();
                        });
                });
            });

            describe("When calling findOne", function () {
                it("The method should return one record when calling by a inserted id", function (done) {
                    partyDao.findOne(insertedRecordOrganization2.id)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            expect(result.id).eq(insertedRecordOrganization2.id);
                            expect(result.name).not.to.be.null;
                            done();
                        });
                });

                it("The method should return null with an invalid id", function (done) {
                    partyDao.findOne(invalidId1)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        });
                });
            });
        });
    });
});
