/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var mongoose = require('mongoose');

var PartyValidator = require("../../../dist/index").PartyValidator;
var EmailAddress = require("../../../dist/index").EmailAddress;
var PostalAddress = require("../../../dist/index").PostalAddress;
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
const name = "John";
const organizationName = "Glarus";
const middleName = "Doe";
const lastName = "Iglesias";
const honorificPrefix = "honorificPrefix";
const honorificSuffix = "honorificSuffix";
const email = "glarus@mail.com";
const email2 = "glarus_sales@mail.com";
const work = "work";
const home = "home";
const phone = "55-55-55-55";
const extension = "11";
const areaCode = "55";
const countryCode = "52";
const cityText = "Mexico city";
const stateText = "CDMX";
const isoCountryCode = "MX";
const line1Address = "Line 1 address";
const line2Address = "Line 2 address";
const line3Address = "Line 3 address";
const postalCode = "05000";


const name2 = "Jane";
const middleName2 = "Smith";
const email3 = "glarus_dev@mail.com";

const invalidEmail = "email.com";

describe("Testing party dao insert methods", function () {
    [partyDaoLokijs, partyDaoMongodb].forEach(function (partyDao) {

        beforeEach(function (done) {
            partyDao.deleteAll()
                .then(function () {
                    done()
                })
                .catch(function (err) {
                    assert.fail("Error", err);
                })
        });

        describe("When inserting a valid person", function () {
            it("The entity should exits in the database", function (done) {
                var person = new PersonEntity();
                person.idAccount = idAccount;
                person.name.first = name;
                person.name.middle = middleName;
                person.name.last = lastName;
                person.name.honorificPrefix = honorificPrefix;
                person.name.honorificSuffix = honorificSuffix;
                person.type = PartyValidator.PERSON;
                person.contact.emails.push(new EmailAddress(work, true, email));
                person.contact.emails.push(new EmailAddress(home, false, email2));
                person.contact.addresses.push(new PostalAddress(
                    home, true, line1Address,
                    line2Address, line3Address, cityText,
                    null, postalCode, stateText, null,
                    isoCountryCode));
                person.contact.phones.push(new PhoneNumber(
                    work,
                    true,
                    phone,
                    extension,
                    areaCode,
                    countryCode
                ));
                partyDao.insert(person)
                    .then(function (result) {
                        expect(result.id).not.to.be.null;
                        validateRecord(result);
                        return partyDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        validateRecord(resultQuery);
                        done();
                    })
            });


            function validateRecord(record) {
                expect(record.idAccount).eq(idAccount);
                expect(record.name.first).eq(name);
                expect(record.name.middle).eq(middleName);
                expect(record.name.last).eq(lastName);
                expect(record.name.honorificPrefix).eq(honorificPrefix);
                expect(record.name.honorificSuffix).eq(honorificSuffix);
                expect(record.type).eq(PartyValidator.PERSON);
                expect(record.contact.emails.length).eq(2);
                expect(record.contact.emails[0].type).eq(work);
                expect(record.contact.emails[0].primary).eq(true);
                expect(record.contact.emails[0].address).eq(email);
                expect(record.contact.emails[1].type).eq(home);
                expect(record.contact.emails[1].primary).eq(false);
                expect(record.contact.emails[1].address).eq(email2);
                expect(record.contact.addresses.length).eq(1);
                expect(record.contact.addresses[0].type).eq(home);
                expect(record.contact.addresses[0].primary).eq(true);
                expect(record.contact.addresses[0].line1).eq(line1Address);
                expect(record.contact.addresses[0].line2).eq(line2Address);
                expect(record.contact.addresses[0].line3).eq(line3Address);
                expect(record.contact.addresses[0].cityText).eq(cityText);
                expect(record.contact.addresses[0].idCity).eq(null);
                expect(record.contact.addresses[0].postalCode).eq(postalCode);
                expect(record.contact.addresses[0].stateText).eq(stateText);
                expect(record.contact.addresses[0].idStateProvince).eq(null);
                expect(record.contact.addresses[0].isoCountryCode).eq(isoCountryCode);
                expect(record.contact.phones.length).eq(1);
                expect(record.contact.phones[0].type).eq(work);
                expect(record.contact.phones[0].primary).eq(true);
                expect(record.contact.phones[0].number).eq(phone);
                expect(record.contact.phones[0].extension).eq(extension);
                expect(record.contact.phones[0].areaCode).eq(areaCode);
                expect(record.contact.phones[0].countryCode).eq(countryCode);
            }
        });


        describe("When inserting a valid organization", function () {
            it("The method should insert the record", function (done) {
                var organization = new OrganizationEntity();
                organization.name = organizationName;
                organization.type = PartyValidator.ORGANIZATION;
                organization.contact.emails.push(new EmailAddress(work, true, email));
                organization.contact.emails.push(new EmailAddress(home, false, email2));
                partyDao.insert(organization)
                    .then(function (result) {
                        expect(result.name).eq(organizationName);
                        expect(result.type).eq(PartyValidator.ORGANIZATION);
                        expect(result.contact.emails.length).eq(2);
                        expect(result.idAccount).to.be.undefined;
                        return partyDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.name).eq(organizationName);
                        expect(resultQuery.type).eq(PartyValidator.ORGANIZATION);
                        expect(resultQuery.contact.emails.length).eq(2);
                        expect(resultQuery.idAccount).to.be.undefined;
                        done();
                    })
            })
        });

        describe("When inserting with invalid data, in this case an invalid email", function () {
            it("The entity should insert en error", function (done) {
                var person = new PersonEntity();
                person.idAccount = idAccount;
                person.name.first = name;
                person.name.middle = middleName;
                person.type = PartyValidator.PERSON;
                person.contact.emails.push(new EmailAddress(work, true, invalidEmail));
                partyDao.insert(person)
                    .then(function (result) {
                        expect.fail("The method should not have inserted the record");
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        done();
                    })
            });
        });

        describe("When inserting a second party with duplicated email addresses", function () {
            it("The entity should send an error", function (done) {
                var person = new PersonEntity();
                person.idAccount = idAccount;
                person.name.first = name;
                person.name.middle = middleName;
                person.type = PartyValidator.PERSON;
                person.contact.emails.push(new EmailAddress(work, true, email));
                partyDao.insert(person)
                    .then(function (insertedRecord) {
                        var person = new PersonEntity();
                        person.name.first = name2;
                        person.name.middle = middleName2;
                        person.type = PartyValidator.PERSON;
                        person.contact.emails.push(new EmailAddress(work, true, email));
                        person.contact.emails.push(new EmailAddress(home, false, email2));
                        return partyDao.insert(person);
                    })
                    .then(function (resultSecondInsert) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        assert("The method sent an error. It is OK");
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq("contact.emails");
                        expect(err[0].value).eq(email);
                        done();
                    })
            })
        });

        describe("When inserting a second person with the same name", function () {
            it("The entity should send an error", function (done) {
                var person = new PersonEntity();
                person.idAccount = idAccount;
                person.name.first = name;
                person.name.middle = middleName;
                person.type = PartyValidator.PERSON;
                person.contact.emails.push(new EmailAddress(work, true, email));
                person.contact.emails.push(new EmailAddress(home, false, email2));
                partyDao.insert(person)
                    .then(function (insertedRecord) {
                        var person = new PersonEntity();
                        person.name.first = name;
                        person.name.middle = middleName;
                        person.type = PartyValidator.PERSON;
                        person.contact.emails.push(new EmailAddress(work, true, email3));
                        return partyDao.insert(person);
                    })
                    .then(function (resultSecondInsert) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        assert("The method sent an error. It is OK");
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(PersonValidator.NAME);
                        expect(err[0].message).eq(PersonValidator.PERSON_NAME_DUPLICATED);
                        done();
                    })
            })
        });

        describe("When inserting a second organization with the same name", function () {
            it("The entity should send an error", function (done) {
                var organization = new OrganizationEntity();
                organization.idAccount = idAccount;
                organization.name = organizationName;
                organization.type = PartyValidator.ORGANIZATION;
                organization.contact.emails.push(new EmailAddress(work, true, email));
                organization.contact.emails.push(new EmailAddress(home, false, email2));
                partyDao.insert(organization)
                    .then(function (insertedRecord) {
                        var organization = new OrganizationEntity();
                        organization.name = organizationName;
                        organization.type = PartyValidator.ORGANIZATION;
                        organization.contact.emails.push(new EmailAddress(work, true, email3));
                        return partyDao.insert(organization);
                    })
                    .then(function (resultSecondInsert) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        assert("The method sent an error. It is OK");
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(OrganizationValidator.NAME);
                        expect(err[0].message).eq(OrganizationValidator.NAME_DUPLICATED);
                        done();
                    })
            })
        });

        describe("When inserting a second party with the same idAccount", function () {
            it("The entity should send an error", function (done) {
                var person = new PersonEntity();
                person.idAccount = idAccount;
                person.name.first = name;
                person.name.middle = middleName;
                person.type = PartyValidator.PERSON;
                person.contact.emails.push(new EmailAddress(work, true, email));
                person.contact.emails.push(new EmailAddress(home, false, email2));
                partyDao.insert(person)
                    .then(function (insertedRecord) {
                        var organization = new OrganizationEntity();
                        organization.name = organizationName;
                        organization.idAccount = idAccount;
                        organization.type = PartyValidator.ORGANIZATION;
                        organization.contact.emails.push(new EmailAddress(work, true, email3));
                        return partyDao.insert(organization);
                    })
                    .then(function (resultSecondInsert) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        assert("The method sent an error. It is OK");
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(PartyValidator.ID_ACCOUNT);
                        expect(err[0].message).eq(PartyValidator.ID_ACCOUNT_DUPLICATE);
                        expect(err[0].value).eq(idAccount);
                        done();
                    })
            })
        });


        describe("When inserting many records", function () {
            it("The method should have inserted the records", function (done) {
                var organization = new OrganizationEntity();
                organization.name = organizationName;
                organization.type = PartyValidator.ORGANIZATION;
                organization.contact.emails.push(new EmailAddress(work, true, email));
                organization.contact.emails.push(new EmailAddress(home, false, email2));

                var person = new PersonEntity();
                person.name.first = name;
                person.name.middle = middleName;
                person.name.last = lastName;
                person.type = PartyValidator.PERSON;
                person.contact.emails.push(new EmailAddress(work, true, email3));

                partyDao.insertMany([organization, person])
                    .then(function (resultInsert) {
                        expect(resultInsert.length).eq(2);
                        expect(resultInsert[0].name).eq(organizationName);
                        expect(resultInsert[0].type).eq(PartyValidator.ORGANIZATION);
                        expect(resultInsert[0].contact.emails.length).eq(2);
                        expect(resultInsert[1].name.first).eq(name);
                        expect(resultInsert[1].name.middle).eq(middleName);
                        expect(resultInsert[1].name.last).eq(lastName);
                        expect(resultInsert[1].contact.emails.length).eq(1);
                        done();
                        return partyDao.count();
                    })
                    .then(function (count) {
                        expect(count).eq(2);
                    });
            });
        });
    });
});
