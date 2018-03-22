/**
 * Project janux-persist.js
 * Created by ernesto on 10/19/17.
 */

var DataSourceHandler = require("../../dist/index").DataSourceHandler;
var DaoFactory = require("../../dist/index").DaoFactory;
var EntityPropertiesImpl = require("../../dist/index").EntityPropertiesImpl;
var DaoSettings = require("../../dist/index").DaoSettings;

var PartyDaoLokiJsImpl = require("../../dist/index").PartyDaoLokiJsImpl;
var PartyDaoMongooseImpl = require("../../dist/index").PartyDaoMongooseImpl;
var PartyMongooseSchema = require("../../dist/index").PartyMongooseSchema;

var AccountDaoLokiJsImpl = require("../../dist/index").AccountDaoLokiJsImpl;
var AccountDaoMongooseImpl = require("../../dist/index").AccountDaoMongooseImpl;
var AccountMongooseDbSchema = require("../../dist/index").AccountMongooseDbSchema;

var AuthContextDaoLokiJsImpl = require("../../dist/index").AuthContextDaoLokiJsImpl;
var AuthContextDaoMongooseImpl = require("../../dist/index").AuthContextDaoMongooseImpl;
var AuthContextMongooseDbSchema = require("../../dist/index").AuthContextMongooseDbSchema;

var RoleDaoMongooseImpl = require("../../dist/index").RoleDaoMongooseImpl;
var RoleDaoLokiJsImpl = require("../../dist/index").RoleDaoLokiJsImpl;
var RoleMongooseDbSchema = require("../../dist/index").RoleMongooseDbSchema;

var StaffDataDao = require("../../dist/index").StaffDataDao;
var StaffDataMongooseDbSchema = require("../../dist/index").StaffDataMongooseDbSchema;

var GroupDao = require("../../dist/index").GroupDao;
var GroupMongooseSchema = require("../../dist/index").GroupMongooseSchema;

var GroupContentDao = require("../../dist/index").GroupContentDao;
var GroupContentMongooseSchema = require("../../dist/index").GroupContentMongooseSchema;


var GroupAttributeValueDao = require("../../dist/index").GroupAttributeValueDao;
var GroupAttributeValueMongooseSchema = require("../../dist/index").GroupAttributeValueMongooseSchema;

const PARTY_DEFAULT_COLLECTION_NAME = 'contact';
const ACCOUNT_DEFAULT_COLLECTION_NAME = 'account';
const AUTH_CONTEXT_DEFAULT_COLLECTION_NAME = 'authcontext';
const ROLE_DEFAULT_COLLECTION_NAME = 'role';
const GROUP_DEFAULT_COLLECTION_NAME = 'group';
const GROUP_CONTENT_DEFAULT_COLLECTION_NAME = 'groupContent';
const GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME = "groupAttribute";
const STAFF_COLLECTION_NAME = "staff";

function createPartyDao(dbEngine, dbPath) {
	var dao;
	if (dbEngine === DataSourceHandler.MONGOOSE) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), PartyMongooseSchema), PartyDaoMongooseImpl);
	} else if (dbEngine === DataSourceHandler.LOKIJS) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), PartyDaoLokiJsImpl);

	}
	return dao;
}

function createAccountDao(dbEngine, dbPath) {
	var dao;
	if (dbEngine === DataSourceHandler.MONGOOSE) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AccountMongooseDbSchema), AccountDaoMongooseImpl);
	} else if (dbEngine === DataSourceHandler.LOKIJS) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AccountDaoLokiJsImpl);
	}
	return dao;
}


function createAuthContextDao(dbEngine, dbPath) {
	var dao;
	if (dbEngine === DataSourceHandler.MONGOOSE) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, AUTH_CONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AuthContextMongooseDbSchema), AuthContextDaoMongooseImpl);
	} else if (dbEngine === DataSourceHandler.LOKIJS) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, AUTH_CONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AuthContextDaoLokiJsImpl);
	}
	return dao;
}

function createRoleDao(dbEngine, dbPath) {
	var dao;
	if (dbEngine === DataSourceHandler.MONGOOSE) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), RoleMongooseDbSchema), RoleDaoMongooseImpl);
	} else if (dbEngine === DataSourceHandler.LOKIJS) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), RoleDaoLokiJsImpl);
	}
	return dao;
}

function createGroupDao(dbEngine, dbPath) {
	var dao;
	if (dbEngine === DataSourceHandler.MONGOOSE) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupMongooseSchema), GroupDao);
	} else if (dbEngine === DataSourceHandler.LOKIJS) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupDao);
	}
	return dao;
}

function createGroupContentDao(dbEngine, dbPath) {
	var dao;
	if (dbEngine === DataSourceHandler.MONGOOSE) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupContentMongooseSchema), GroupContentDao);
	} else if (dbEngine === DataSourceHandler.LOKIJS) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupContentDao);
	}
	return dao;
}


function createGroupAttributesDao(dbEngine, dbPath) {
	var dao;
	if (dbEngine === DataSourceHandler.MONGOOSE) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupAttributeValueMongooseSchema), GroupAttributeValueDao);
	} else if (dbEngine === DataSourceHandler.LOKIJS) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupAttributeValueDao);
	}
	return dao;
}

function createStaffDataDao(dbEngine, dbPath) {
	var dao;
	if (dbEngine === DataSourceHandler.MONGOOSE) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, STAFF_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), StaffDataMongooseDbSchema), StaffDataDao);
	} else if (dbEngine === DataSourceHandler.LOKIJS) {
		dao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, dbPath, STAFF_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), StaffDataDao);
	}
	return dao;
}

module.exports = {
	createPartyDao          : createPartyDao,
	createAccountDao        : createAccountDao,
	createAuthContextDao    : createAuthContextDao,
	createRoleDao           : createRoleDao,
	createGroupDao          : createGroupDao,
	createGroupContentDao   : createGroupContentDao,
	createGroupAttributesDao: createGroupAttributesDao,
	createStaffDataDao      : createStaffDataDao
};
