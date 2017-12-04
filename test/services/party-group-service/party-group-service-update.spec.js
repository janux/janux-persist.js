/**
 * Project janux-persist.js
 * Created by ernesto on 12/4/17.
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

describe("Testing party group service item item methods", function () {

	var partyDao;
	var groupContentDao;
	var groupDao;
	var groupAttributeValueDao;

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

		partyService = new PartyServiceImpl(partyDao);
		groupService = new GroupServiceImpl(groupDao, groupContentDao, groupAttributeValueDao);
		partyGroupService = new PartyGroupServiceImpl(partyService, groupService);

		setTimeout(function () {
			Promise.props({
				partyDaoResult: partyService.removeAll(),
				groupContentDaoResult: groupContentDao.removeAll(),
				groupDaoResult: groupDao.removeAll(),
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
			type: type,
			name: name,
			code: code,
			description: description,
			values: [
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
			type: type2,
			name: name2,
			code: code2,
			description: description2,
			values: [
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
			type: type,
			name: name3,
			code: code3,
			description: description3,
			values: [
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
			type: type2,
			name: name4,
			code: code4,
			description: description4,
			values: [
				{
					party: insertedParty3
				},
				{
					party: insertedParty4
				}
			]
		};
	}

	describe("When calling update with the correct parameters", function () {
	    it("The method should update the group", function (done) {
			assert.fail();
			done();
		});
	});


	describe("When calling update when trying to change the party owner", function () {
		it("The method should return an error", function (done) {
			assert.fail();
			done();
		});
	});


	describe("When calling update with duplicated party items", function () {
		it("The method should return an error", function (done) {
			assert.fail();
			done();
		});
	});


	describe("When calling updated with party items that does not exist in the database", function () {
		it("The method should return an error", function (done) {
			assert.fail();
			done();
		});
	});

});

