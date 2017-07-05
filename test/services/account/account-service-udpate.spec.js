/**
 * Project janux-persistence
 * Created by ernesto on 6/29/17.
 */
var chai = require('chai');
var config = require('config');
var BootstrapService = require("../../../dist/index").BootstrapService;
var AccountService = require("../../../dist/index").AccountService;
var Persistence = require("../../../dist/index").Persistence;
var RoleEntity = require("../../../dist/index").RoleEntity;
var PartyValidator = require("../../../dist/index").PartyValidator;
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
const organizationDisplayName = "Glarus display name";
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
var invalidId1 = "313030303030303030303030";


describe("Testing auth context service update method", function () {
    describe("Given the inserted roles and accounts", function () {

        var insertedRole1;
        var insertedRole2;
        var insertedAccount1;
        var insertedAccount2;

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
                    var account = {
                        username: accountUsername,
                        password: accountPassword,
                        enabled: accountEnabled,
                        locked: accountLocked,
                        expire: accountExpire,
                        expirePassword: accountExpirePassword,
                        contact: {
                            type: PartyValidator.PERSON,
                            name: {
                                first: personName,
                                middle: personMiddleName,
                                last: personLastName
                            },
                            emails: [{
                                type: contactType,
                                primary: true,
                                address: contactEmail
                            }]
                        },
                        roles: [insertedRole1]
                    };
                    return AccountService.insert(account)
                })
                .then(function (insertedAccount) {
                    insertedAccount1 = insertedAccount;
                    var account2 = {
                        username: accountUsername2,
                        password: accountPassword2,
                        enabled: accountEnabled2,
                        locked: accountLocked2,
                        expire: accountExpire2,
                        expirePassword: accountExpirePassword2,
                        contact: {
                            type: PartyValidator.ORGANIZATION,
                            name: organizationName,
                            emails: [{
                                type: organizationContactType,
                                primary: true,
                                address: organizationContactEmail
                            }]
                        },
                        roles: [insertedRole1]
                    };
                    return AccountService.insert(account2)
                })
                .then(function (insertedAccount) {
                    insertedAccount2 = insertedAccount;
                    done();
                })
        });

    });
});
