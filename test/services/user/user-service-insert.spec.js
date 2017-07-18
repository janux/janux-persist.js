/**
 * Project janux-persistence
 * Created by ernesto on 6/29/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var BootstrapService = require("../../../dist/index").BootstrapService;
var UserService = require("../../../dist/index").UserService;
var AccountValidator = require("../../../dist/index").AccountValidator;
var Persistence = require("../../../dist/index").Persistence;
var EmailAddress = require("janux-people.js").EmailAddress;
var Person = require("janux-people.js").Person;
var Organization = require("janux-people.js").Organization;
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbParams = dbEngine === BootstrapService.LOKIJS ? lokiJsDBPath : mongoConnUrl;

const organizationName = "Glarus";
const organizationContactEmail = "sales@glarus.com";

const personName = "John";
const personMiddleName = "Doe";
const personLastName = "Doe";
const contactEmail = "dev@glarus.com";
const contactType = "work";

const contactEmail2 = "test@glarus.com";
const contactType2 = "work";

const accountUsername = "username";
const accountPassword = "password";
const accountEnabled = true;
const accountLocked = false;
const accountExpire = undefined;
const accountExpirePassword = undefined;

const accountUsername2 = "username2";
const accountPassword2 = "password2";
const accountEnabled2 = true;
const accountLocked2 = false;
const accountExpire2 = undefined;
const accountExpirePassword2 = undefined;
var invalidId1 = "313030303030303030303030";

describe("Testing user service service insert method", function () {
    describe("Given the inserted contacts", function () {
        var insertedParty1;
        var insertedParty2;

        beforeEach(function (done) {
            BootstrapService.start(dbEngine, dbParams)
                .then(function () {
                    return Persistence.userDao.deleteAll();
                })
                .then(function () {
                    return Persistence.partyDao.deleteAll();
                })
                .then(function () {

                    // Inserting one person
                    var person = new Person();
                    person.name.first = personName;
                    person.name.middle = personMiddleName;
                    person.name.last = personLastName;
                    person.setContactMethod(contactType, new EmailAddress(contactEmail));
                    return Persistence.partyDao.insert(person);
                })
                .then(function (insertedPerson) {
                    insertedParty1 = insertedPerson;
                    //Inserting organization
                    var organization = new Organization();
                    organization.name = organizationName;
                    organization.setContactMethod(contactType, new EmailAddress(organizationContactEmail));
                    return Persistence.partyDao.insert(organization);
                })
                .then(function (insertedOrganization) {
                    insertedParty2 = insertedOrganization;
                    done();
                })
                .catch(function (err) {
                    assert.fail();
                    done();
                })
        });


        describe("When inserting an correct account with an contact id", function () {
            it("It should not return any error", function (done) {
                var contactReference = insertedParty1.toJSON();
                contactReference.id = insertedParty1.id;
                contactReference.typeName = insertedParty1.typeName;
                var account = {
                    username: accountUsername,
                    password: accountPassword,
                    enabled: accountEnabled,
                    locked: accountLocked,
                    expire: accountExpire,
                    expirePassword: accountExpirePassword,
                    contact: contactReference,
                    roles: [
                        "admin",
                        "auth context"
                    ]
                };

                UserService.insert(account)
                    .then(function (result) {
                        expect(result.id).not.to.be.undefined;
                        expect(result.username).eq(accountUsername);
                        expect(result.dateCreated).not.to.be.undefined;
                        expect(result.password).eq(accountPassword);
                        expect(result.enabled).eq(accountEnabled);
                        expect(result.locked).eq(accountLocked);
                        expect(result.expire).eq(accountExpire);
                        expect(result.expirePassword).eq(accountExpirePassword);
                        expect(result.contact.id).eq(insertedParty1.id);
                        expect(result.contact.typeName).not.to.be.undefined;
                        expect(result.contact.displayName).not.to.be.undefined;
                        expect(result.contact.emails[0].address).eq(contactEmail);
                        temporalAccount = result;

                        //Let's check if the party has the associated account.
                        return Persistence.partyDao.findOneById(result.contact.id);
                    })
                    .then(function (resultQueryPart) {
                        expect(resultQueryPart.id).eq(insertedParty1.id);
                        expect(resultQueryPart.emailAddresses(false).length).eq(1);
                        expect(resultQueryPart.emailAddresses(false)[0].address).eq(contactEmail);
                        expect(resultQueryPart.emailAddresses(false)[0].type).eq(contactType);
                        expect(resultQueryPart.emailAddresses(false)[0].primary).eq(true);
                        return Persistence.userDao.findAll()
                    })
                    .then(function (resultQueryAccount) {
                        expect(resultQueryAccount.length).eq(1);
                        expect(resultQueryAccount[0].username).eq(accountUsername);
                        expect(resultQueryAccount[0].password).eq(accountPassword);
                        expect(resultQueryAccount[0].enabled).eq(accountEnabled);
                        expect(resultQueryAccount[0].locked).eq(accountLocked);
                        expect(resultQueryAccount[0].expire).eq(accountExpire);
                        expect(resultQueryAccount[0].expirePassword).eq(accountExpirePassword);
                        expect(resultQueryAccount[0].contactId).eq(temporalAccount.contact.id);
                        done();
                    })
                    .catch(function (err) {
                        expect.fail("The method should have inserted the record");
                        done();
                    })
            });
        });

        describe("When inserting an account with an contact id that is already associated with another account", function () {
            it("It should return an error", function (done) {
                var contactReference = insertedParty1.toJSON();
                contactReference.id = insertedParty1.id;
                contactReference.typeName = insertedParty1.typeName;
                var account = {
                    username: accountUsername,
                    password: accountPassword,
                    enabled: accountEnabled,
                    locked: accountLocked,
                    expire: accountExpire,
                    expirePassword: accountExpirePassword,
                    contact: contactReference,
                    roles: [
                        "ADMIN",
                        "TEST"
                    ]
                };
                UserService.insert(account)
                    .then(function (insertedRecord) {
                        var contactReference2 = insertedParty1.toJSON();
                        contactReference2.id = insertedParty1.id;
                        contactReference2.typeName = insertedParty1.typeName;
                        var account2 = {
                            username: accountUsername2,
                            password: accountPassword2,
                            enabled: accountEnabled2,
                            locked: accountLocked2,
                            expire: accountExpire2,
                            expirePassword: accountExpirePassword2,
                            contact: contactReference2,
                            roles: [
                                "USERS"
                            ]
                        };
                        return UserService.insert(account2);
                    })
                    .then(function (inaertedRecord2) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(UserService.ACCOUNT);
                        expect(err[0].message).eq(UserService.ANOTHER_ACCOUNT_USING_CONTACT);
                        done();
                    });

            });
        });

        describe("When inserting an account with an contact id that does't exits in the database", function () {
            it("It should return an error", function (done) {
                var account = {
                    username: accountUsername,
                    password: accountPassword,
                    enabled: accountEnabled,
                    locked: accountLocked,
                    expire: accountExpire,
                    expirePassword: accountExpirePassword,
                    contact: {id: invalidId1},
                    roles: [
                        "ADMIN",
                        "TEST"
                    ]
                };
                UserService.insert(account)
                    .then(function (insertedRecord) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(UserService.PARTY);
                        expect(err[0].message).eq(UserService.NO_CONTACT_IN_DATABASE);
                        done();
                    })
            });
        });

        describe("When inserting an account with a valid new contact", function () {
            it("It should not return any error", function (done) {
                var newPerson = new Person();
                newPerson.name.first = personName;
                newPerson.name.middle = personMiddleName;
                newPerson.name.last = personLastName;
                newPerson.setContactMethod(contactType2, new EmailAddress(contactEmail2));
                var contactReference = newPerson.toJSON();
                contactReference.typeName = newPerson.typeName;
                var account = {
                    username: accountUsername2,
                    password: accountPassword2,
                    enabled: accountEnabled2,
                    locked: accountLocked2,
                    expire: accountExpire2,
                    expirePassword: accountExpirePassword2,
                    contact: newPerson.toJSON(),
                    roles: ["ADMIN"]
                };
                UserService.insert(account)
                    .then(function (result) {
                        expect(result.dateCreated).not.to.be.null;
                        return Persistence.partyDao.findOneById(result.contactId);
                    })
                    .then(function (resultQuery) {
                        expect(resultQuery).not.to.be.null;
                        expect(resultQuery.dateCreated).not.to.be.undefined;
                        done();
                    })
                    .catch(function (err) {
                        expect.fail("The method should have inserted the record");
                        done();
                    })
            });
        });

        /*describe("When inserting an account with new contact info, but invalid info.", function () {
         it("It should return an error", function (done) {
         var account = {
         username: accountUsername2,
         password: accountPassword2,
         enabled: accountEnabled2,
         locked: accountLocked2,
         expire: accountExpire2,
         expirePassword: accountExpirePassword2,
         contact: {
         name: {
         first: personName2,
         middle: personMiddleName2,
         last: personLastName2
         }
         },
         roles: [
         insertedRole1,
         insertedRole2
         ]
         };
         AccountService.insert(account)
         .then(function (result) {
         expect.fail("The method should not have inserted the record");
         done();
         })
         .catch(function (err) {
         expect(err.length).eq(1);
         expect(err[0].attribute).eq(PartyValidator.CONTACTS_EMAILS);
         expect(err[0].message).eq(PartyValidator.AT_LEAST_ONE_EMAIL);
         done();
         })
         });
         });*/

        /*describe("When inserting an account with new contact info, but with duplicated email address", function () {
         it("It should return an error", function (done) {
         var account = {
         username: accountUsername,
         password: accountPassword,
         enabled: accountEnabled,
         locked: accountLocked,
         expire: accountExpire,
         expirePassword: accountExpirePassword,
         contact: insertedParty1,
         roles: [
         insertedRole1,
         insertedRole2
         ]
         };
         AccountService.insert(account)
         .then(function (result) {
         var duplicatedEmailAccount = {
         username: accountUsername2,
         password: accountPassword2,
         enabled: accountEnabled2,
         locked: accountLocked2,
         expire: accountExpire2,
         expirePassword: accountExpirePassword2,
         contact: {
         type: PartyValidator.PERSON,
         displayName: displayName2,
         name: {
         first: personName2,
         middle: personMiddleName2,
         last: personLastName2
         },
         emails: [{
         type: contactType,
         primary: true,
         address: contactEmail
         }]
         },
         roles: [insertedRole1]
         };
         return AccountService.insert(duplicatedEmailAccount)
         })
         .then(function (insertedSecondAccount) {
         expect.fail("The method should not have inserted the records")
         })
         .catch(function (err) {
         expect(err.length).eq(1);
         expect(err[0].attribute).eq(PartyValidator.CONTACTS_EMAILS);
         expect(err[0].message).eq(PartyValidator.THERE_IS_ANOTHER_PARTY_WITH_SAME_EMAIL);
         done();
         })
         });
         });*/

        describe("When inserting an account with a duplicated username", function () {
            it("The method should return an error", function (done) {
                var contactReference = insertedParty1.toJSON();
                contactReference.id = insertedParty1.id;
                contactReference.typeName = insertedParty1.typeName;
                var account = {
                    username: accountUsername,
                    password: accountPassword,
                    enabled: accountEnabled,
                    locked: accountLocked,
                    expire: accountExpire,
                    expirePassword: accountExpirePassword,
                    contact: contactReference,
                    roles: [
                        "admin",
                        "root"
                    ]
                };
                UserService.insert(account)
                    .then(function (result) {
                        var contactReference2 = insertedParty2.toJSON();
                        contactReference2.id = insertedParty2.id;
                        contactReference2.typeName = insertedParty2.typeName;
                        var duplicatedUserNameAccount = {
                            username: accountUsername,
                            password: accountPassword2,
                            enabled: accountEnabled2,
                            locked: accountLocked2,
                            expire: accountExpire2,
                            expirePassword: accountExpirePassword2,
                            contact: contactReference2,
                            roles: ["root"]
                        };
                        return UserService.insert(duplicatedUserNameAccount)
                    })
                    .then(function (result2) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].message).eq(AccountValidator.ANOTHER_USER);
                        done();
                    });
            })
        });
    })
});
