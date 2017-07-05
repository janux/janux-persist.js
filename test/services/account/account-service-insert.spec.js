/**
 * Project janux-persistence
 * Created by ernesto on 6/29/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var BootstrapService = require("../../../dist/index").BootstrapService;
var AccountService = require("../../../dist/index").AccountService;
var AccountValidator = require("../../../dist/index").AccountValidator;
var Persistence = require("../../../dist/index").Persistence;
var RoleEntity = require("../../../dist/index").RoleEntity;
var PersonEntity = require("../../../dist/index").PersonEntity;
var EmailAddress = require("../../../dist/index").EmailAddress;
var PartyValidator = require("../../../dist/index").PartyValidator;
var OrganizationEntity = require("../../../dist/index").OrganizationEntity;
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbParams = dbEngine === BootstrapService.LOKIJS ? lokiJsDBPath : mongoConnUrl;

const roleName = "A role name";
const roleName2 = "A role name 2";
const roleDescription = "A role description";
const roleDescription2 = "A role description 2";

const organizationName = "Glarus";
const organizationDisplayName = "Display name Glarus";
const organizationContactEmail = "sales@glarus.com";

const personName = "John";
const displayName = "display name";
const personMiddleName = "Doe";
const personLastName = "Doe";
const contactEmail = "dev@glarus.com";
const contactType = "work";

const personName2 = "Jane";
const displayName2 = "display name 2";
const personMiddleName2 = "Doe";
const personLastName2 = "Doe";
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

describe("Testing auth context service insert method", function () {
    describe("Given the inserted roles an contacts", function () {
        var insertedRole1;
        var insertedRole2;
        var insertedParty1;
        var insertedParty2;

        beforeEach(function (done) {
            BootstrapService.start(dbEngine, dbParams)
                .then(function () {
                    return Persistence.rolePermissionBitDao.deleteAll()
                })
                .then(function () {
                    return Persistence.roleDao.deleteAll();
                })
                .then(function () {
                    return Persistence.rolePermissionBitDao.deleteAll();
                })
                .then(function () {
                    return Persistence.accountRoleDao.deleteAll();
                })
                .then(function () {
                    return Persistence.accountDao.deleteAll();
                })
                .then(function () {
                    return Persistence.partyDao.deleteAll();
                })
                .then(function () {
                    // Inserting fake roles.
                    var role1 = new RoleEntity(roleName, roleDescription, true, true, undefined);
                    var role2 = new RoleEntity(roleName2, roleDescription2, true, true, undefined);
                    return Persistence.roleDao.insertMany([role1, role2]);
                })
                .then(function (insertedRoles) {
                    insertedRole1 = insertedRoles[0];
                    insertedRole2 = insertedRoles[1];

                    // Inserting one person
                    var person = new PersonEntity();
                    person.type = PartyValidator.PERSON;
                    person.displayName = displayName;
                    person.name.first = personName;
                    person.name.middle = personMiddleName;
                    person.name.last = personLastName;
                    person.emails.push(new EmailAddress(contactType, true, contactEmail));
                    return Persistence.partyDao.insert(person);
                })
                .then(function (insertedPerson) {
                    insertedParty1 = insertedPerson;
                    //Inserting organization
                    var organization = new OrganizationEntity();
                    organization.type = PartyValidator.ORGANIZATION;
                    organization.displayName = organizationDisplayName;
                    organization.name = organizationName;
                    organization.emails.push(new EmailAddress(contactType, true, organizationContactEmail));
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

            var temporalAccount;

            it("It should not return any error", function (done) {
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
                        expect(result.id).not.to.be.undefined;
                        expect(result.username).eq(accountUsername);
                        expect(result.dateCreated).not.to.be.undefined;
                        expect(result.password).eq(accountPassword);
                        expect(result.enabled).eq(accountEnabled);
                        expect(result.locked).eq(accountLocked);
                        expect(result.expire).eq(accountExpire);
                        expect(result.expirePassword).eq(accountExpirePassword);
                        expect(result.contactId).eq(insertedParty1.id);
                        expect(result.contact.id).eq(insertedParty1.id);
                        expect(result.contact.displayName).eq(insertedParty1.displayName);
                        expect(result.contact.idAccount).eq(result.id);
                        expect(result.contact.emails[0].address).eq(contactEmail);
                        expect(result.roles.length).eq(2);
                        expect(result.roles[0].id).eq(insertedRole1.id);
                        expect(result.roles[1].id).eq(insertedRole2.id);
                        expect(result.roles[0].name).eq(insertedRole1.name);
                        expect(result.roles[1].name).eq(insertedRole2.name);
                        temporalAccount = result;

                        //Let's check if the party has the associated account.
                        return Persistence.partyDao.findOneById(result.contact.id);
                    })
                    .then(function (resultQueryPart) {
                        expect(resultQueryPart.id).eq(insertedParty1.id);
                        expect(resultQueryPart.idAccount).eq(temporalAccount.id);
                        expect(resultQueryPart.emails.length).eq(1);
                        expect(resultQueryPart.emails[0].address).eq(contactEmail);
                        expect(resultQueryPart.emails[0].type).eq(contactType);
                        expect(resultQueryPart.emails[0].primary).eq(true);
                        return Persistence.accountDao.findAll()
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
                        return Persistence.accountRoleDao.findAll()
                    })
                    .then(function (accountRoleQueryResult) {
                        expect(accountRoleQueryResult.length).eq(2);
                        expect(accountRoleQueryResult[0].idRole).eq(insertedRole1.id);
                        expect(accountRoleQueryResult[1].idRole).eq(insertedRole2.id);
                        expect(accountRoleQueryResult[1].idAccount).eq(temporalAccount.id);
                        expect(accountRoleQueryResult[1].idAccount).eq(temporalAccount.id);
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
                    .then(function (insertedRecord) {
                        var account2 = {
                            username: accountUsername2,
                            password: accountPassword2,
                            enabled: accountEnabled2,
                            locked: accountLocked2,
                            expire: accountExpire2,
                            expirePassword: accountExpirePassword2,
                            contact: insertedParty1,
                            roles: [
                                insertedRole1
                            ]
                        };
                        return AccountService.insert(account2);
                    })
                    .then(function (inaertedRecord2) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(AccountService.ACCOUNT);
                        expect(err[0].message).eq(AccountService.ANOTHER_ACCOUNT_USING_CONTACT);
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
                        insertedRole1,
                        insertedRole2
                    ]
                };
                AccountService.insert(account)
                    .then(function (insertedRecord) {
                        expect.fail("The method should not have inserted the record");
                        done();
                    })
                    .catch(function (err) {
                        expect(err.length).eq(1);
                        expect(err[0].attribute).eq(AccountService.PARTY);
                        expect(err[0].message).eq(AccountService.NO_CONTACT_IN_DATABASE);
                        done();
                    })
            });
        });

        describe("When inserting an account with a valid new contact", function () {
            it("It should not return any error", function (done) {
                var account = {
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
                            type: contactType2,
                            primary: true,
                            address: contactEmail2
                        }]

                    },
                    roles: [insertedRole1]
                };
                AccountService.insert(account)
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

        describe("When inserting an account with new contact info, but invalid info.", function () {
            it("It should return an error", function (done) {
                var account = {
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
        });

        describe("When inserting an account with new contact info, but with duplicated email address", function () {
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
        });

        describe("When inserting an account with a duplicated username", function () {
            it("The method should return an error", function (done) {
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
                        var duplicatedUserNameAccount = {
                            username: accountUsername,
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
                                    address: contactEmail2
                                }]
                            },
                            roles: [insertedRole1]
                        };
                        return AccountService.insert(duplicatedUserNameAccount)
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
