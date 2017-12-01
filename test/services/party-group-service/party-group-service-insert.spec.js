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
const name = "a group name";
const description = "a group description";
const code = "simple_party_code";
const customValue = 'customValue';
var flag = "true";
var flag2 = "false";

describe("Testing party group service insert methods", function () {

	var partyDao;
	var groupContentDao;
	var groupDao;
	var groupAttributeValueDao;

	var insertedParty1;
	var insertedParty2;
	var insertedParty3;

	var partyService;
	var groupService;
	var partyGroupService;


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
					return partyService.insertMany([party1, party2, party3])
				})
				.then(function (result) {
					insertedParty1 = result[0];
					insertedParty2 = result[1];
					insertedParty3 = result[2];
					done();
				});
		}, 20);
	});


	function getSampleGroup() {

		return {
			type: type,
			name: name,
			code: code,
			description: description,
			attributes: {customValue: customValue},
			values: [
				{
					party: insertedParty1,
					attributes: {flag: flag}
				},
				{
					party: insertedParty2,
					attributes: {flag: flag2}
				}
			]
		};
	}

	describe("When calling insert with the correct params", function () {
		it("The method should insert the group", function (done) {
			var group = getSampleGroup();
			partyGroupService.insert(insertedParty3.id, group)
				.then(function (result) {
					expect(result.values.length).eq(2);
					expect(result.attributes[PartyGroupServiceImpl.ATTRIBUTE_PARTY_ID]).eq(insertedParty3.id);
					expect(result.attributes.customValue).eq(customValue);
					expect(result.type).eq(type);
					expect(result.code).eq(code);
					var element1 = _.find(result.values, function (o) {
						return o.party.id === insertedParty1.id;
					});
					expect(_.isEqual(element1.party, insertedParty1)).eq(true);
					expect(element1.attributes.flag).eq(flag);

					var element2 = _.find(result.values, function (o) {
						return o.party.id === insertedParty2.id;
					});
					expect(_.isEqual(element2.party, insertedParty2)).eq(true);
					expect(element2.attributes.flag).eq(flag2);
					return groupService.findOne(result.code);
				})
				.then(function (result) {
					expect(result.values.length).eq(2);
					expect(result.attributes[PartyGroupServiceImpl.ATTRIBUTE_PARTY_ID]).eq(insertedParty3.id);
					expect(result.attributes.customValue).eq(customValue);
					expect(result.type).eq(type);
					expect(result.code).eq(code);
					expect(result.values.length).eq(2);
					var element1 = _.find(result.values, function (o) {
						return o.partyId === insertedParty1.id;
					});
					expect(element1.partyId).eq(insertedParty1.id);
					expect(element1.attributes.flag).eq(flag);

					var element2 = _.find(result.values, function (o) {
						return o.partyId === insertedParty2.id;
					});
					expect(element2.partyId).eq(insertedParty2.id);
					expect(element2.attributes.flag).eq(flag2);

					done();
				});
		});
	});

	describe("When calling insert with incorrect party owner", function () {
		it("The method should return an error", function (done) {
			var group = getSampleGroup();
			var invalid = "invalid";
			partyGroupService.insert(invalid, group)
				.then(function (result) {
					expect.fail("The method should not have inserted the record");
				}, function (err) {
					expect(err.length).eq(1);
					expect(err[0].attribute).eq(PartyGroupServiceImpl.PARTY_OWNER);
					expect(err[0].message).eq(PartyGroupServiceImpl.PARTY_OWNER_DOES_NOT_EXIST);
					expect(err[0].value).eq(invalid);
					done();
				});
		});
	});

	describe("When calling insert with a party item that does not exist in the database", function () {
		it("The method should return an error", function (done) {
			var group = getSampleGroup();
			group.values[0].party.id = 'invalid';
			partyGroupService.insert(insertedParty3.id, group)
				.then(function (result) {
					expect.fail("The method should not have inserted the record");
				}, function (err) {
					expect(err.length).eq(1);
					expect(err[0].attribute).eq(PartyGroupServiceImpl.PARTY_ITEM);
					expect(err[0].message).eq(PartyGroupServiceImpl.PARTY_ITEM_DOES_NOT_EXIST);
					done();
				});
		});
	});

	describe("When calling insert with duplicated items", function () {
		it("The method should return a null", function (done) {
			var group = getSampleGroup();
			group.values.push({
				party: insertedParty1
			});
			partyGroupService.insert(insertedParty3.id, group)
				.then(function () {
					expect.fail("The method should not have inserted the record");
				}, function (err) {
					expect(err.length);
					expect(err[0].attribute).eq(PartyGroupServiceImpl.PARTY_ITEM);
					expect(err[0].message).eq(PartyGroupServiceImpl.PARTY_ITEM_DUPLICATED);
					expect(err[0].value).eq(insertedParty1.id);
					done();
				});
		});
	});

	describe("When inserting a group with different code, but with the same type and party owner", function () {
		it("The method should return an error", function (done) {
			var group = getSampleGroup();
			partyGroupService.insert(insertedParty3.id, group)
				.then(function (result) {
					var duplicatedGroup = getSampleGroup();
					duplicatedGroup.code = "a second code";
					return partyGroupService.insert(insertedParty3.id, duplicatedGroup);
				})
				.then(function () {
					expect.fail("The method should not have inserted the record");
					done();
				}, function (err) {
					expect(err.length).eq(1);
					expect(err[0].attribute).eq(PartyGroupServiceImpl.PARTY_OWNER);
					expect(err[0].message).eq(PartyGroupServiceImpl.PARTY_OWNER_DUPLICATED_GROUP);
					expect(err[0].value).eq(group.code);
					done();
				})
		});
	});
});
