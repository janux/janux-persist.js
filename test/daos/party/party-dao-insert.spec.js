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
const name = "John";
const middleName = "Doe";
const email = "glarus@mail.com";
const email2 = "glarus_sales@mail.com";
const work = "work";
const home = "home";
const phone = "55-55-55-55";
const extension = "11";
const areaCode = "55";
const countryCode = "52";
const phone2 = "55-55-55-56";
const cityText = "Mexico city";
const stateText = "CDMX";
const idCountry = "313030303030303030303032";
const line1Address = "Line 1 address";
const line2Address = "Line 2 address";
const line3Address = "Line 3 address";
const postalCode = "05000";


const name2 = "Jane";
const middleName2 = "Smith";

describe("Testing role dao insert methods", function () {
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

        describe("When inserting a valid entity", function () {
            it("The entity should exits in the database", function (done) {
                var person = new PersonEntity();
                person.idAccount = idAccount;
                person.name.first = name;
                person.name.middle = middleName;
                person.type = PartyValidator.PERSON;
                person.contact.emails.push(new EmailAddress(work, true, email));
                person.contact.emails.push(new EmailAddress(home, false, email2));
                person.contact.addresses.push(new PostalAddress(
                    home, true, line1Address,
                    line2Address, line3Address, cityText,
                    null, postalCode, stateText, null,
                    idCountry));
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
                        expect(result.idAccount).eq(idAccount);
                        expect(result.name.first).eq(name);
                        expect(result.name.middle).eq(middleName);
                        expect(result.type).eq(PartyValidator.PERSON);
                        expect(result.contact.emails.length).eq(2);
                        expect(result.contact.emails[0].type).eq(work);
                        expect(result.contact.emails[0].primary).eq(true);
                        expect(result.contact.emails[0].address).eq(email);
                        expect(result.contact.emails[1].type).eq(home);
                        expect(result.contact.emails[1].primary).eq(false);
                        expect(result.contact.emails[1].address).eq(email2);
                        expect(result.contact.addresses.length).eq(1);
                        expect(result.contact.addresses[0].type).eq(home);
                        expect(result.contact.addresses[0].primary).eq(true);
                        expect(result.contact.addresses[0].line1).eq(line1Address);
                        expect(result.contact.addresses[0].line2).eq(line2Address);
                        expect(result.contact.addresses[0].line3).eq(line3Address);
                        expect(result.contact.addresses[0].cityText).eq(cityText);
                        expect(result.contact.addresses[0].idCity).eq(null);
                        expect(result.contact.addresses[0].postalCode).eq(postalCode);
                        expect(result.contact.addresses[0].stateText).eq(stateText);
                        expect(result.contact.addresses[0].idStateProvince).eq(null);
                        expect(result.contact.addresses[0].idCountry).eq(idCountry);
                        expect(result.contact.phones.length).eq(1);
                        expect(result.contact.phones[0].type).eq(work);
                        expect(result.contact.phones[0].primary).eq(true);
                        expect(result.contact.phones[0].number).eq(phone);
                        expect(result.contact.phones[0].extension).eq(extension);
                        expect(result.contact.phones[0].areaCode).eq(areaCode);
                        expect(result.contact.phones[0].countryCode).eq(countryCode);
                        return partyDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.idAccount).eq(idAccount);
                        expect(resultQuery.name.first).eq(name);
                        expect(resultQuery.name.middle).eq(middleName);
                        expect(resultQuery.type).eq(PartyValidator.PERSON);
                        expect(resultQuery.contact.emails.length).eq(2);
                        expect(resultQuery.contact.emails[0].type).eq(work);
                        expect(resultQuery.contact.emails[0].primary).eq(true);
                        expect(resultQuery.contact.emails[0].address).eq(email);
                        expect(resultQuery.contact.emails[1].type).eq(home);
                        expect(resultQuery.contact.emails[1].primary).eq(false);
                        expect(resultQuery.contact.emails[1].address).eq(email2);
                        expect(resultQuery.contact.addresses.length).eq(1);
                        expect(resultQuery.contact.addresses[0].type).eq(home);
                        expect(resultQuery.contact.addresses[0].primary).eq(true);
                        expect(resultQuery.contact.addresses[0].line1).eq(line1Address);
                        expect(resultQuery.contact.addresses[0].line2).eq(line2Address);
                        expect(resultQuery.contact.addresses[0].line3).eq(line3Address);
                        expect(resultQuery.contact.addresses[0].cityText).eq(cityText);
                        expect(resultQuery.contact.addresses[0].idCity).eq(null);
                        expect(resultQuery.contact.addresses[0].postalCode).eq(postalCode);
                        expect(resultQuery.contact.addresses[0].stateText).eq(stateText);
                        expect(resultQuery.contact.addresses[0].idStateProvince).eq(null);
                        expect(resultQuery.contact.addresses[0].idCountry).eq(idCountry);
                        expect(resultQuery.contact.phones.length).eq(1);
                        expect(resultQuery.contact.phones[0].type).eq(work);
                        expect(resultQuery.contact.phones[0].primary).eq(true);
                        expect(resultQuery.contact.phones[0].number).eq(phone);
                        expect(resultQuery.contact.phones[0].extension).eq(extension);
                        expect(resultQuery.contact.phones[0].areaCode).eq(areaCode);
                        expect(resultQuery.contact.phones[0].countryCode).eq(countryCode);
                        done();
                    })
            });
        });


        describe("When inserting a second party with duplicated email", function () {
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
                        expect(err.length).eq(2);
                        expect(err[0].attribute).eq("contact.emails");
                        expect(err[1].attribute).eq("contact.emails");
                        expect(err[0].value).eq(email);
                        expect(err[1].value).eq(email2);
                        done();
                    })
            })
        });
    });
});
