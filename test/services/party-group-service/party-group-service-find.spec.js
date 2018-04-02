/**
 * Project janux-persist.js
 * Created by ernesto on 11/30/17.
 */
var chai = require('chai');
var _ = require('lodash');
var SampleData = require("../../util/sample-data");
var DaoUtil = require("../../daos/dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var PartyServiceImpl = require("../../../dist/index").PartyServiceImpl;
var GroupServiceImpl = require("../../../dist/index").GroupServiceImpl;
var PartyGroupServiceImpl = require("../../../dist/index").PartyGroupServiceImpl;
var expect = chai.expect;
var config = require('config');
var Promise = require('bluebird');
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

const type = "aGroupType";
const type2 = "anotherType";
const type3 = "aThirdType";

const name = "a group name";
const description = "a group description";
const code = "simple_party_code";
const customValue = 'customValue';


const name2 = "a second group";
const code2 = "a second code";
const description2 = "a second description";

const name3 = "a third group";
const code3 = "a third code";
const description3 = "a third description";

const name4 = "a fourth group";
const code4 = "a fourth code";
const description4 = "a fourth description";

describe("Testing party group service find methods", function () {

	var partyDao;
	var groupContentDao;
	var groupDao;
	var groupAttributeValueDao;
	var staffDao;

	var insertedParty1;
	var insertedParty2;
	var insertedParty3;
	var insertedParty4;

	var partyService;
	var groupService;
	var partyGroupService;

	var insertedGroup1;
	var insertedGroup2;
	var insertedGroup3;
	var insertedGroup4;


	beforeEach(function (done) {
		partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
		groupContentDao = DaoUtil.createGroupContentDao(dbEngine, dbPath);
		groupDao = DaoUtil.createGroupDao(dbEngine, dbPath);
		groupAttributeValueDao = DaoUtil.createGroupAttributesDao(dbEngine, dbPath);
		staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
		partyService = new PartyServiceImpl(partyDao, staffDao);
		groupService = new GroupServiceImpl(groupDao, groupContentDao, groupAttributeValueDao);
		partyGroupService = new PartyGroupServiceImpl(partyService, groupService);

		setTimeout(function () {
			Promise.props({
				partyDaoResult              : partyService.removeAll(),
				groupContentDaoResult       : groupContentDao.removeAll(),
				groupDaoResult              : groupDao.removeAll(),
				groupAttributeValueDaoResult: groupAttributeValueDao.removeAll()
			})
				.then(function (value) {
					//Inserting sample data.
					var party1 = SampleData.createPerson1();
					var party2 = SampleData.createPerson2();
					var party3 = SampleData.createOrganization1();
					var party4 = SampleData.createOrganization2();
					return partyService.insertMany([party1, party2, party3, party4])
				})
				.then(function (result) {
					insertedParty1 = result[0];
					insertedParty2 = result[1];
					insertedParty3 = result[2];
					insertedParty4 = result[3];

					var group1 = getSampleGroup();
					var group2 = getSampleGroup2();
					var group3 = getSampleGroup3();
					var group4 = getSampleGroup4();

					return Promise.props({
						group1: partyGroupService.insert(insertedParty3.id, group1),
						group2: partyGroupService.insert(insertedParty3.id, group2),
						group3: partyGroupService.insert(insertedParty1.id, group3),
						group4: partyGroupService.insert(insertedParty1.id, group4)
					});
				})
				.then(function (result) {
					insertedGroup1 = result.group1;
					insertedGroup2 = result.group2;
					insertedGroup3 = result.group3;
					insertedGroup4 = result.group4;
					done();
				});
		}, 5);
	});


	function getSampleGroup() {
		return {
			type       : type,
			name       : name,
			code       : code,
			description: description,
			values     : [
				{
					party: insertedParty1
				},
				{
					party: insertedParty2
				}
			]
		};
	}

	function getSampleGroup2() {
		return {
			type       : type2,
			name       : name2,
			code       : code2,
			description: description2,
			values     : [
				{
					party: insertedParty1
				},
				{
					party: insertedParty2
				}
			]
		};
	}

	function getSampleGroup3() {
		return {
			type       : type,
			name       : name3,
			code       : code3,
			description: description3,
			values     : [
				{
					party: insertedParty3
				},
				{
					party: insertedParty4
				}
			]
		};
	}

	function getSampleGroup4() {
		return {
			type       : type2,
			name       : name4,
			code       : code4,
			description: description4,
			values     : [
				{
					party: insertedParty3
				},
				{
					party: insertedParty4
				}
			]
		};
	}

	describe("When calling findPropertiesOwnedByPartyAndTypes", function () {
		it("The method should return the correct values", function (done) {
			partyGroupService.findPropertiesOwnedByPartyAndTypes(insertedParty1.id, [type, type2])
				.then(function (value) {
					expect(value.length).eq(2);

					var group1 = _.find(value, function (o) {
						return o.code === code3;
					});

					var group2 = _.find(value, function (o) {
						return o.code === code4;
					});

					expect(group1.code).eq(code3);
					expect(group2.code).eq(code4);

					done();
				});
		});
	});

	describe("When calling findPropertiesByType", function () {
		it("The method should return the correct groups", function (done) {
			partyGroupService.findPropertiesByType(type)
				.then(function (value) {
					expect(value.length).eq(2);

					var group1 = _.find(value, function (o) {
						return o.code === code;
					});

					var group2 = _.find(value, function (o) {
						return o.code === code3;
					});

					expect(group1.code).eq(code);
					expect(group2.code).eq(code3);
					done();
				});
		});
	});

	describe("When calling find one", function () {
		it("The method should return the correct group", function (done) {
			partyGroupService.findOne(code)
				.then(function (result) {
					expect(result).not.to.be.null;
					expect(result).not.to.be.undefined;
					expect(result.code).eq(code);
					done();
				});
		});
	});

	describe("When calling findOneOwnedByPartyAndType", function () {
		it("The method should return the correct group", function (done) {
			partyGroupService.findOneOwnedByPartyAndType(insertedParty3.id, type)
				.then(function (value) {
					expect(value).not.to.be.undefined;
					expect(value).not.to.be.null;
					expect(value.code).eq(code);
					done();
				});
		});
	});

	describe("When calling findOneOwnedByPartyAndType", function () {
		it("The method should return a null record", function (done) {
			partyGroupService.findOneOwnedByPartyAndType(insertedParty3.id, type3)
				.then(function (value) {
					expect(value).eq(null);
					done();
				});
		});
	});

	describe("When calling findOneOwnedByPartyAndType with the flag as true", function () {
		it("The method should insert and return a record", function (done) {
			partyGroupService.findOneOwnedByPartyAndType(insertedParty3.id, type3, true)
				.then(function (value) {
					expect(value).not.to.be.undefined;
					expect(value).not.to.be.null;
					expect(value.code).not.to.be.undefined;
					done();
				});
		});
	});


	describe("When calling findByTypes", function () {
		it("The method should return the correct groups", function (done) {
			partyGroupService.findByTypes([type, type2])
				.then(function (value) {
					expect(value.length).eq(4);
					done();
				});
		});
	});

	describe("When calling findByTypes with only one type", function () {
		it("The method should return the correct groups", function (done) {
			partyGroupService.findByTypes([type2])
				.then(function (value) {
					expect(value.length).eq(2);
					done();
				});
		});
	});


});
