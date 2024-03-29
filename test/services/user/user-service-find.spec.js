/**
 * Project janux-persistence
 * Created by ernesto on 7/11/17.
 */
var chai = require("chai");
var config = require("config");
var UserService = require("../../../dist/index").UserService;
var PartyService = require("../../../dist/index").PartyServiceImpl;
var PartyGroupService = require("../../../dist/index").PartyGroupServiceImpl;
var GroupService = require("../../../dist/index").GroupServiceImpl;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var PasswordService = require("../../../dist/index").PasswordService;
var DaoUtil = require("../../daos/dao-util");
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

describe("Testing user service find method", function() {
	describe("Given the inserted roles and accounts", function() {
		var partyDao;
		var accountDao;
		var userService;
		var insertedUser1;
		var insertedUser2;
		var partyService;
		var staffDao;
		var groupDao;
		var groupService;
		var groupContentDao;
		var groupAttributeValueDao;
		var partyGroupService;
		var passwordService;

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
			passwordService = new PasswordService();
			userService = UserService.createInstance(accountDao, partyService, passwordService);
			staffDao
				.removeAll()
				.then(function() {
					return partyDao.removeAll();
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
					return UserService.insert(account2);
				})
				.then(function(insertedUser) {
					insertedUser2 = insertedUser;
					done();
				});
		});
	});
});
