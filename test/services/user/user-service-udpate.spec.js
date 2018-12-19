/**
 * Project janux-persistence
 * Created by ernesto on 6/29/17.
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var DaoUtil = require("../../daos/dao-util");
var UserService = require("../../../dist/index").UserService;
var PartyService = require("../../../dist/index").PartyServiceImpl;
var GroupService = require("../../../dist/index").GroupServiceImpl;
var PartyGroupService = require("../../../dist/index").PartyGroupServiceImpl;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var serverAppContext = config.get("serverAppContext");
var EmailAddress = require("janux-people").EmailAddress;
var Person = require("janux-people").Person;
var Organization = require("janux-people").Organization;
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

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

describe("Testing user service update method", function() {
	describe("Given the inserted roles and accounts", function() {
		var partyDao;
		var accountDao;
		var userService;
		var insertedUser1;
		var insertedUser2;
		var partyService;
		var staffDao;
		var groupDao;
		var groupContentDao;
		var groupAttributeValueDao;
		var groupService;
		var partyGroupService;

		beforeEach(function(done) {
			partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
			accountDao = DaoUtil.createAccountDao(dbEngine, dbPath);
			staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
			groupDao = DaoUtil.createGroupDao(dbEngine, dbPath);
			groupContentDao = DaoUtil.createGroupContentDao(dbEngine, dbPath);
			groupAttributeValueDao = DaoUtil.createGroupAttributesDao(dbEngine, dbPath);
			partyService = new PartyService(partyDao, staffDao);
			groupService = new GroupService(groupDao, groupContentDao, groupAttributeValueDao);
			partyGroupService = new PartyGroupService(partyService, groupService);
			userService = UserService.createInstance(accountDao, partyService, partyGroupService);
			accountDao
				.removeAll()
				.then(function() {
					return partyDao.removeAll();
				})
				.then(function() {
					return staffDao.removeAll();
				})
				.then(function() {
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
					return userService.insert(account);
				})
				.then(function(insertedUser) {
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
					return userService.insert(account2);
				})
				.then(function(insertedUser) {
					insertedUser2 = insertedUser;
					done();
				});
		});

		describe("When updating the account", function() {
			it("The method should update the account and contact data", function(done) {
				insertedUser1.username = accountUsername3;
				insertedUser1.password = accountPassword3;
				insertedUser1.contact.name.first = personName2;
				insertedUser1.contact.name.middle = "";
				insertedUser1.contact.name.last = personMiddleName2;
				insertedUser1.contact.emails[0].address = contactEmail2;
				userService.update(insertedUser1).then(function(resultUpdate) {
					done();
				});
			});
		});
	});
});
