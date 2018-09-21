var chai = require('chai');
const DaoUtil = require("../../daos/dao-util");
const _ = require("lodash");
var SampleData = require("../../util/sample-data");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var PartyServiceImpl = require("../../../dist/index").PartyServiceImpl;
var ResellerServiceImpl = require("../../../dist/index").ResellerServiceImpl;
var PartyGroupServiceImpl = require("../../../dist/index").PartyGroupServiceImpl;
var GroupServiceImpl = require("../../../dist/index").GroupServiceImpl;
var Constants = require("../../../dist/index").Constants;
const expect = chai.expect;
const config = require('config');
const serverAppContext = config.get("serverAppContext");
const lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
const mongoConnUrl = serverAppContext.db.mongoConnUrl;
const dbEngine = serverAppContext.db.dbEngine;
const dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;
const CODE_RESELLER_CONTACT = "reseller contacts";

describe("Testing reseller service", function () {
	var groupDao;
	var groupContentDao;
	var groupAttributesDao;
	var partyDao;
	var staffDao;
	var partyService;
	var groupService;
	var partyGroupService;

	var contactReseller;
	var contactClient;
	var reseller;
	var client;

	var clientContactsGroup;
	var resellerContactGroup;
	var resellerClientGroup;
	var resellerService;

	function createClientConcatGroup() {
		var result = {
			type       : Constants.GROUP_TYPE_COMPANY_CONTACTS,
			name       : "group client contacts",
			code       : "group client contacts",
			description: "",
			attributes : {},
			values     : [
				{
					party     : contactClient,
					attributes: {}
				}
			]
		};
		return _.cloneDeep(result);
	}

	function createResellerConcatGroup() {
		var result = {
			type       : Constants.GROUP_TYPE_COMPANY_CONTACTS,
			name       : CODE_RESELLER_CONTACT,
			code       : CODE_RESELLER_CONTACT,
			description: "",
			attributes : {},
			values     : [
				{
					party     : contactReseller,
					attributes: {}
				}
			]
		};
		return _.cloneDeep(result);
	}

	function createResellerClientGroup() {
		var result = {
			type       : Constants.GROUP_TYPE_RESELLER_CLIENTS,
			name       : "group reseller clients",
			code       : "group reseller clients",
			description: "",
			attributes : {},
			values     : [
				{
					party     : client,
					attributes: {}
				}
			]
		};
		return _.cloneDeep(result);
	}

	beforeEach(function (done) {
		groupDao = DaoUtil.createGroupDao(dbEngine, dbPath);
		groupContentDao = DaoUtil.createGroupContentDao(dbEngine, dbPath);
		groupAttributesDao = DaoUtil.createGroupAttributesDao(dbEngine, dbPath);
		partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
		staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
		partyService = new PartyServiceImpl(partyDao, staffDao);
		groupService = new GroupServiceImpl(groupDao, groupContentDao, groupAttributesDao);
		partyGroupService = new PartyGroupServiceImpl(partyService, groupService);
		resellerService = new ResellerServiceImpl(partyService, partyGroupService);
		groupAttributesDao.removeAll()
			.then(function () {
				return groupContentDao.removeAll();
			})
			.then(function () {
				return groupDao.removeAll();
			})
			.then(function () {
				return partyService.removeAll();
			})
			.then(function () {
				var party1 = SampleData.createPerson1();
				var party2 = SampleData.createPerson2();
				var party3 = SampleData.createOrganization1();
				var party4 = SampleData.createOrganization2();
				return partyService.insertMany([party1, party2, party3, party4])
			})
			.then(function (result) {
				contactReseller = result[0];
				contactClient = result[1];
				reseller = result[2];
				client = result[3];

				// Inserting client contact group.
				clientContactsGroup = createClientConcatGroup();
				return partyGroupService.insert(client.id, clientContactsGroup);
			})
			.then(function () {
				// Inserting reseller contact group.
				resellerContactGroup = createResellerConcatGroup();
				return partyGroupService.insert(reseller.id, resellerContactGroup);
			})
			.then(function () {
				// Inserting reseller client groups.
				resellerClientGroup = createResellerClientGroup();
				return partyGroupService.insert(reseller.id, resellerClientGroup);
			})
			.then(function () {
				done();
			});
	});


	describe("When calling findReseller", function () {
		it("The method should return the client", function (done) {
			resellerService.findReseller(client.id)
				.then(function (result) {
					expect(result.name).eq(reseller.name);
					expect(result.id).eq(reseller.id);
					done();
				})
		});
	});


	describe("When calling findResellerContactsByClient", function () {
		it("The method should return the reseller contacts group", function (done) {
			resellerService.findResellerContactsByClient(client.id)
				.then(function (result) {
					expect(result.code).eq(CODE_RESELLER_CONTACT);
					expect(result.values[0].party.id).eq(contactReseller.id);
					done();
				});
		});
	});
});
