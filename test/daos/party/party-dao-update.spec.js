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
var PhoneNumber = require("../../../dist/index").PhoneNumber;
var PersonEntity = require("../../../dist/index").PersonEntity;
var PersonValidator = require("../../../dist/index").PersonValidator;
var OrganizationEntity = require("../../../dist/index").OrganizationEntity;
var OrganizationValidator = require("../../../dist/index").OrganizationValidator;
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
const phone = "55-55-55-55";

const organizationName = "Glarus";
const organizationName2 = "Glarus 2";

const name2 = "Jane";
const middleName2 = "Smith";


const invalidEmail = "email.com";

describe("Testing party dao update methods", function () {
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
                        organization.displayName = displayName;
                        organization.name = organizationName;
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


            describe("When updating a party with a duplicated email", function () {
                it("The method should return an error", function (done) {
                    insertedRecordPerson.emails.push(new EmailAddress(home, false, email));
                    partyDao.update(insertedRecordPerson)
                        .then(function (updatedRecord) {
                            expect.fail("The method should not have updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            done();
                        })
                })
            });

            describe("When updating a party with a duplicated idAccount", function () {
                it("The method should return an error", function (done) {
                    insertedRecordPerson.idAccount = idAccount;
                    partyDao.update(insertedRecordPerson)
                        .then(function (updatedRecord) {
                            expect.fail("The method should not have updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq(PartyValidator.ID_ACCOUNT);
                            expect(err[0].message).eq(PartyValidator.ID_ACCOUNT_DUPLICATE);
                            expect(err[0].value).eq(idAccount);
                            done();
                        })
                })
            });

            describe("When updating a party with invalid info", function () {
                it("The method should return an error", function (done) {
                    insertedRecordPerson.emails.push(new EmailAddress(work, true, invalidEmail));
                    partyDao.update(insertedRecordPerson)
                        .then(function (updatedRecord) {
                            expect.fail("The method should not have updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(2);
                            done();
                        })
                })
            });

            describe("When updating an organization with a duplicated name", function () {
                it("The method should return an error", function (done) {
                    insertedRecordOrganization2.name = organizationName;
                    partyDao.update(insertedRecordOrganization2)
                        .then(function (updatedRecord) {
                            expect.fail("The method should not have updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq(OrganizationValidator.NAME);
                            expect(err[0].message).eq(OrganizationValidator.NAME_DUPLICATED);
                            expect(err[0].value).eq(organizationName);
                            done();
                        })
                });
            });


            describe("When updating a person with a duplicated name", function () {
                it("The method should return an error", function (done) {
                    insertedRecordPerson2.name.first = firstName;
                    insertedRecordPerson2.name.middle = middleName;
                    insertedRecordPerson2.name.last = lastName;
                    partyDao.update(insertedRecordPerson2)
                        .then(function (updatedRecord) {
                            expect.fail("The method should not have updated the record");
                            done();
                        })
                        .catch(function (err) {
                            expect(err.length).eq(1);
                            expect(err[0].attribute).eq(PersonValidator.NAME);
                            expect(err[0].message).eq(PersonValidator.PERSON_NAME_DUPLICATED);
                            done();
                        })
                });
            });

            describe("When updating a party with the correct info", function () {
                it("The method should not return an error", function (done) {
                    insertedRecordPerson2.phones.push(new PhoneNumber(work, true, phone, "", "", ""));
                    partyDao.update(insertedRecordPerson2)
                        .then(function (result) {
                            expect(result.phones.length).eq(1);
                            done();
                        })
                        .catch(function (err) {
                            expect.fail("Error");
                            done();
                        })
                });
            });
        });
    });
});
