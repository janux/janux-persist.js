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
var EmailAddress = require("../../../dist/index").EmailAddress;
var PersonEntity = require("../../../dist/index").PersonEntity;
var OrganizationEntity = require("../../../dist/index").OrganizationEntity;
var PartyDaoLokiJsImpl = require("../../../dist/index").PartyDaoLokiJsImpl;
var PartyDaoMongoDbImpl = require("../../../dist/index").PartyDaoMongoDbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var PartyMongoDbSchema = require("../../../dist/index").PartyMongoDbSchema;

//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath, {throttledSaves: true});
var dbEngineUtilLokijs = new DbEngineUtilLokijs('party-test', lokiDatabase);
var partyDaoLokijs = new PartyDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('party-test', PartyMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var partyDaoMongodb = new PartyDaoMongoDbImpl(dbEngineMongoDb, null);

const idAccount = "313030303030303030303037";
const idAccount2 = "313030303030303030303038";
const firstName = "John";
const middleName = "Doe";
const displayName = "Display name";
const lastName = "Iglesias";
const honorificPrefix = "honorificPrefix";
const honorificSuffix = "honorificSuffix";
const email = "glarus@mail.com";
const email2 = "glarus_sales@mail.com";
const email3 = "glarus_dev@mail.com";
const email4 = "glarus_sys@mail.com";
const email5 = "glarus_admin@mail.com";
const work = "work";
const home = "home";

const organizationName = "Glarus";
const organizationName2 = "Glarus 2";

const name2 = "Jane";
const middleName2 = "Smith";


var invalidId1 = "313030303030303030303030";
var invalidId2 = "313030303030303030303032";

describe("Testing party dao find  methods", function () {
    [partyDaoLokijs, partyDaoMongodb].forEach(function (partyDao) {
        describe("Given the inserted records", function () {

            var insertedRecordOrganization;
            var insertedRecordPerson;
            var insertedRecordOrganization2;
            var insertedRecordPerson2;

            beforeEach(function (done) {
                partyDao.deleteAll()
                    .then(function () {
                        var organization = new OrganizationEntity();
                        organization.idAccount = idAccount;
                        organization.name = organizationName;
                        organization.displayName = displayName;
                        organization.type = PartyValidator.ORGANIZATION;
                        organization.emails.push(new EmailAddress(work, true, email));
                        organization.emails.push(new EmailAddress(home, false, email2));

                        var person = new PersonEntity();
                        person.displayName = displayName;
                        person.name.first = firstName;
                        person.name.middle = middleName;
                        person.name.last = lastName;
                        person.type = PartyValidator.PERSON;
                        person.emails.push(new EmailAddress(work, true, email3));

                        var organization2 = new OrganizationEntity();
                        organization2.displayName = displayName;
                        organization2.name = organizationName2;
                        organization2.type = PartyValidator.ORGANIZATION;
                        organization2.emails.push(new EmailAddress(work, true, email4));

                        var person2 = new PersonEntity();
                        person2.idAccount = idAccount2;
                        person2.displayName = displayName;
                        person2.name.first = name2;
                        person2.name.middle = middleName2;
                        person2.type = PartyValidator.PERSON;
                        person2.emails.push(new EmailAddress(work, true, email5));


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


            describe("When calling findAllPeople", function () {
                it("The method should return 2 records", function (done) {
                    partyDao.findAllPeople()
                        .then(function (result) {
                            expect(result.length).eq(2);
                            expect(result[0].type).eq(PartyValidator.PERSON);
                            expect(result[1].type).eq(PartyValidator.PERSON);
                            done();
                        });
                })
            });

            describe("When calling findAllOrganizations", function () {
                it("The method should return 2 records", function (done) {
                    partyDao.findAllOrganizations()
                        .then(function (result) {
                            expect(result.length).eq(2);
                            expect(result[0].type).eq(PartyValidator.ORGANIZATION);
                            expect(result[1].type).eq(PartyValidator.ORGANIZATION);
                            done();
                        });
                })
            });

            describe("When calling findAllAccounts", function () {
                it("The method findAllAccounts return 2 records", function (done) {
                    partyDao.findAllAccounts()
                        .then(function (result) {
                            expect(result.length).eq(2);
                            expect(result[0].idAccount).eq(idAccount);
                            expect(result[1].idAccount).eq(idAccount2);
                            expect(result[0].type).eq(PartyValidator.ORGANIZATION);
                            expect(result[1].type).eq(PartyValidator.PERSON);
                            done();
                        });
                })
            });

            describe("When calling the method findAllByIds", function () {
                it("The method should return one record", function (done) {
                    partyDao.findAllByIds([invalidId1, invalidId2, insertedRecordOrganization2.id])
                        .then(function (result) {
                            expect(result.length).eq(1);
                            done();
                        });
                });
            });

            describe("When calling findOneById", function () {
                it("The method should return one record when calling by a inserted id", function (done) {
                    partyDao.findOneById(insertedRecordOrganization2.id)
                        .then(function (result) {
                            expect(result).not.to.be.null;
                            expect(result.id).eq(insertedRecordOrganization2.id);
                            expect(result.name).not.to.be.null;
                            done();
                        });
                });

                it("The method should return null with an invalid id", function (done) {
                    partyDao.findOneById(invalidId1)
                        .then(function (result) {
                            expect(result).to.be.null;
                            done();
                        });
                });
            });
        });
    });
});
