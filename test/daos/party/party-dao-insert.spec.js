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
var EmailAddress = require("janux-people.js").EmailAddress;
var PostalAddress = require("janux-people.js").PostalAddress;
var PhoneNumber = require("janux-people.js").PhoneNumber;
var PersonEntity = require("janux-people.js").Person;
var OrganizationEntity = require("janux-people.js").Organization;
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

const organizationName = "Glarus";
// const organizationDisplayName = "organization display name";
const firstName = "John";
const middleName = "Doe";
const lastName = "Iglesias";
// const displayName = "display name";
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
const countryIsoCode = "MX";
const line1Address = "Line 1 address";
const line2Address = "Line 2 address";
const line3Address = "Line 3 address";
const postalCode = "05000";


const name2 = "Jane";
const middleName2 = "Smith";
const email3 = "glarus_dev@mail.com";

const invalidEmail = "email.com";

describe("Testing party dao insert methods", function () {
    [partyDaoLokijs,partyDaoMongodb].forEach(function (partyDao) {

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
                person.name.first = firstName;
                person.name.middle = middleName;
                person.name.last = lastName;
                person.name.honorificPrefix = honorificPrefix;
                person.name.honorificSuffix = honorificSuffix;

                var emailObject = new EmailAddress();
                emailObject.address = email;
                person.setContactMethod(work, emailObject);


                // var email2 = new EmailAddress();
                // email2.address = email2;
                // person.setContactMethod(home,email2);


                var postalAddressObject = new PostalAddress();
                postalAddressObject.line1 = line1Address;
                postalAddressObject.line2 = line2Address;
                postalAddressObject.line3 = line3Address;
                postalAddressObject.cityText = cityText;
                postalAddressObject.postalCode = postalCode;
                postalAddressObject.stateText = stateText;

                person.setContactMethod(home, postalAddressObject);


                var phoneNumberObject = new PhoneNumber();
                phoneNumberObject.number = phone;
                phoneNumberObject.extension = extension;
                phoneNumberObject.areaCode = areaCode;
                phoneNumberObject.countryCode = countryCode;
                person.setContactMethod(work, phoneNumberObject);
                partyDao.insert(person)
                    .then(function (result) {
                        expect(result.id).not.to.be.undefined;
                        validateRecord(result);
                        return partyDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.id).not.to.be.undefined;
                        validateRecord(resultQuery);
                        done();
                    })
            });


            function validateRecord(record) {
                // expect(record.displayName).eq(displayName);
                expect(record.name.first).eq(firstName);
                expect(record.name.middle).eq(middleName);
                expect(record.name.last).eq(lastName);
                expect(record.name.honorificPrefix).eq(honorificPrefix);
                expect(record.name.honorificSuffix).eq(honorificSuffix);
                expect(record.typeName).eq(PartyValidator.PERSON);
                expect(record.emailAddresses(false).length).eq(1);
                expect(record.emailAddresses(false)[0].type).eq(work);
                expect(record.emailAddresses(false)[0].primary).eq(true);
                expect(record.emailAddresses(false)[0].address).eq(email);
                //expect(record.emailAddresses(false)[1].type).eq(home);
                //expect(record.emailAddresses(false)[1].primary).eq(false);
                //expect(record.emailAddresses(false)[1].address).eq(email2);
                expect(record.postalAddresses(false).length).eq(1);
                expect(record.postalAddresses(false)[0].type).eq(home);
                expect(record.postalAddresses(false)[0].primary).eq(true);
                expect(record.postalAddresses(false)[0].line1).eq(line1Address);
                expect(record.postalAddresses(false)[0].line2).eq(line2Address);
                expect(record.postalAddresses(false)[0].line3).eq(line3Address);
                expect(record.postalAddresses(false)[0].cityText).eq(cityText);
                expect(record.postalAddresses(false)[0].postalCode).eq(postalCode);
                expect(record.postalAddresses(false)[0].stateText).eq(stateText);
                expect(record.phoneNumbers(false).length).eq(1);
                expect(record.phoneNumbers(false)[0].type).eq(work);
                expect(record.phoneNumbers(false)[0].primary).eq(true);
                expect(record.phoneNumbers(false)[0].number).eq(phone);
                expect(record.phoneNumbers(false)[0].extension).eq(extension);
                expect(record.phoneNumbers(false)[0].areaCode).eq(areaCode);
                expect(record.phoneNumbers(false)[0].countryCode).eq(countryCode);
            }
        });


        describe("When inserting a valid organization", function () {
            it("The method should insert the record", function (done) {
                var organization = new OrganizationEntity();
                // organization.displayName = organizationDisplayName;
                organization.name = organizationName;
                var emailObject = new EmailAddress();
                emailObject.address = email;
                organization.setContactMethod(home, emailObject);

                partyDao.insert(organization)
                    .then(function (result) {
                        expect(result.name).eq(organizationName);
                        expect(result.typeName).eq(PartyValidator.ORGANIZATION);
                        expect(result.emailAddresses(false).length).eq(1);
                        return partyDao.findOneById(result.id);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery.name).eq(organizationName);
                        expect(resultQuery.typeName).eq(PartyValidator.ORGANIZATION);
                        expect(resultQuery.emailAddresses(false).length).eq(1);
                        done();
                    })
            })
        });

        /*describe("When inserting with invalid data, in this case an invalid email", function () {
         it("The entity should insert en error", function (done) {
         var person = new PersonEntity();
         // person.displayName = displayName;
         person.name.first = firstName;
         person.name.middle = middleName;
         person.emails.push(new EmailAddress(work, true, invalidEmail));
         partyDao.insert(person)
         .then(function (result) {
         expect.fail("The method should not have inserted the record");
         })
         .catch(function (err) {
         expect(err.length).eq(1);
         done();
         })
         });
         });*/

        // describe("When inserting a second party with duplicated email addresses", function () {
        //     it("The entity should send an error", function (done) {
        //         var person = new PersonEntity();
        //         person.displayName = displayName;
        //         person.name.first = name;
        //         person.name.middle = middleName;
        //         person.type = PartyValidator.PERSON;
        //         person.emails.push(new EmailAddress(work, true, email));
        //         partyDao.insert(person)
        //             .then(function (insertedRecord) {
        //                 var person = new PersonEntity();
        //                 person.displayName = displayName;
        //                 person.name.first = name2;
        //                 person.name.middle = middleName2;
        //                 person.type = PartyValidator.PERSON;
        //                 person.emails.push(new EmailAddress(work, true, email));
        //                 person.emails.push(new EmailAddress(home, false, email2));
        //                 return partyDao.insert(person);
        //             })
        //             .then(function (resultSecondInsert) {
        //                 expect.fail("The method should not have inserted the record");
        //                 done();
        //             })
        //             .catch(function (err) {
        //                 assert("The method sent an error. It is OK");
        //                 expect(err.length).eq(1);
        //                 expect(err[0].attribute).eq("contact.emails");
        //                 expect(err[0].value).eq(email);
        //                 done();
        //             })
        //     })
        // });

        // describe("When inserting a second person with the same name", function () {
        //     it("The entity should send an error", function (done) {
        //         var person = new PersonEntity();
        //         person.displayName = displayName;
        //         person.name.first = name;
        //         person.name.middle = middleName;
        //         person.type = PartyValidator.PERSON;
        //         person.emails.push(new EmailAddress(work, true, email));
        //         person.emails.push(new EmailAddress(home, false, email2));
        //         partyDao.insert(person)
        //             .then(function (insertedRecord) {
        //                 var person = new PersonEntity();
        //                 person.displayName = displayName;
        //                 person.name.first = name;
        //                 person.name.middle = middleName;
        //                 person.type = PartyValidator.PERSON;
        //                 person.emails.push(new EmailAddress(work, true, email3));
        //                 return partyDao.insert(person);
        //             })
        //             .then(function (resultSecondInsert) {
        //                 expect.fail("The method should not have inserted the record");
        //                 done();
        //             })
        //             .catch(function (err) {
        //                 assert("The method sent an error. It is OK");
        //                 expect(err.length).eq(1);
        //                 expect(err[0].attribute).eq(PersonValidator.NAME);
        //                 expect(err[0].message).eq(PersonValidator.PERSON_NAME_DUPLICATED);
        //                 done();
        //             })
        //     })
        // });

        // describe("When inserting a second organization with the same name", function () {
        //     it("The entity should send an error", function (done) {
        //         var organization = new OrganizationEntity();
        //         organization.name = organizationName;
        //         organization.displayName = organizationDisplayName;
        //         organization.type = PartyValidator.ORGANIZATION;
        //         organization.emails.push(new EmailAddress(work, true, email));
        //         organization.emails.push(new EmailAddress(home, false, email2));
        //         partyDao.insert(organization)
        //             .then(function (insertedRecord) {
        //                 var organization = new OrganizationEntity();
        //                 organization.name = organizationName;
        //                 organization.displayName = organizationDisplayName;
        //                 organization.type = PartyValidator.ORGANIZATION;
        //                 organization.emails.push(new EmailAddress(work, true, email3));
        //                 return partyDao.insert(organization);
        //             })
        //             .then(function (resultSecondInsert) {
        //                 expect.fail("The method should not have inserted the record");
        //                 done();
        //             })
        //             .catch(function (err) {
        //                 assert("The method sent an error. It is OK");
        //                 expect(err.length).eq(1);
        //                 expect(err[0].attribute).eq(OrganizationValidator.NAME);
        //                 expect(err[0].message).eq(OrganizationValidator.NAME_DUPLICATED);
        //                 done();
        //             })
        //     })
        // });

        describe("When inserting many records", function () {
            it("The method should have inserted the records", function (done) {
                var organization = new OrganizationEntity();
                organization.name = organizationName;
                var emailObject1 = new EmailAddress(email);
                organization.setContactMethod(home, emailObject1);


                var person = new PersonEntity();
                person.name.first = firstName;
                person.name.middle = middleName;
                person.name.last = lastName;
                var emailObject2 = new EmailAddress(email2);
                person.setContactMethod(work, emailObject2);


                partyDao.insertMany([organization, person])
                    .then(function (resultInsert) {
                        expect(resultInsert.length).eq(2);
                        expect(resultInsert[0].name).eq(organizationName);
                        // expect(resultInsert[0].displayName).eq(organizationDisplayName);
                        expect(resultInsert[0].typeName).eq(PartyValidator.ORGANIZATION);
                        expect(resultInsert[0].emailAddresses(false).length).eq(1);
                        // expect(resultInsert[1].displayName).eq(displayName);
                        expect(resultInsert[1].typeName).eq(PartyValidator.PERSON);
                        expect(resultInsert[1].name.first).eq(firstName);
                        expect(resultInsert[1].name.middle).eq(middleName);
                        expect(resultInsert[1].name.last).eq(lastName);
                        expect(resultInsert[1].emailAddresses(false).length).eq(1);
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
