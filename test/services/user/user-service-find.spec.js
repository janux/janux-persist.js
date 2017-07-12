/**
 * Project janux-persistence
 * Created by ernesto on 7/11/17.
 */
var chai = require('chai');
var config = require('config');
var BootstrapService = require("../../../dist/index").BootstrapService;
var UserService = require("../../../dist/index").UserService;
var Persistence = require("../../../dist/index").Persistence;
var serverAppContext = config.get("serverAppContext");
var EmailAddress = require("janux-people.js").EmailAddress;
var Person = require("janux-people.js").Person;
var Organization = require("janux-people.js").Organization;
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbParams = dbEngine === BootstrapService.LOKIJS ? lokiJsDBPath : mongoConnUrl;

const organizationName = "Glarus";
const organizationContactEmail = "sales@glarus.com";
const organizationContactType = "work";

const personName = "John";
const personMiddleName = "Doe";
const personLastName = "Doe";
const contactEmail = "dev@glarus.com";
const contactType = "work";

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


const accountUsername3 = "username3";
const accountPassword3 = "password3";
const personName2 = "Jane";
const personMiddleName2 = "Smith";
const contactEmail2 = "dev_full_stack@glarus.com";

describe("Testing auth context service find method", function () {
    describe("Given the inserted roles and accounts", function () {

        var insertedUser1;
        var insertedUser2;

        beforeEach(function (done) {
            BootstrapService.start(dbEngine, dbParams)
                .then(function () {
                    return Persistence.userDao.deleteAll();
                })
                .then(function () {
                    return Persistence.partyDao.deleteAll();
                })
                .then(function () {
                    var person = new Person();
                    person.name.first = personName;
                    person.name.middle = personMiddleName;
                    person.name.last = personLastName;
                    person.setContactMethod(contactType, new EmailAddress(contactEmail));
                    var contactReference = person.toJSON();
                    contactReference.typeName = person.typeName;
                    var account = {
                        username: accountUsername,
                        password: accountPassword,
                        enabled: accountEnabled,
                        locked: accountLocked,
                        expire: accountExpire,
                        expirePassword: accountExpirePassword,
                        contact: contactReference,
                        roles: ["admin"]
                    };
                    return UserService.insert(account)
                })
                .then(function (insertedUser) {
                    insertedUser1 = insertedUser;
                    var organization = new Organization();
                    organization.name = organizationName;
                    organization.setContactMethod(organizationContactType, new EmailAddress(organizationContactEmail));
                    var contactReference = organization.toJSON();
                    contactReference.typeName = organization.typeName;
                    var account2 = {
                        username: accountUsername2,
                        password: accountPassword2,
                        enabled: accountEnabled2,
                        locked: accountLocked2,
                        expire: accountExpire2,
                        expirePassword: accountExpirePassword2,
                        contact: contactReference,
                        roles: ["user"]
                    };
                    return UserService.insert(account2)
                })
                .then(function (insertedUser) {
                    insertedUser2 = insertedUser;
                    done();
                })
        });

        describe("When calling findAllByContactNameMatch with a name that exists in the database",function () {
            it("The method should return a recird",function (done) {
                UserService.findAllByContactNameMatch(personName)
                    .then(function (result) {
                        done();
                    });
            })
        })
    });
});
