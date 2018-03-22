/**
 * Project janux-persist.js
 * Created by ernesto on 12/04/17.
 */


var chai = require('chai');
var _ = require('lodash');
var SampleData = require("../../util/sample-data");
var DaoUtil = require("../../daos/dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var PartyServiceImpl = require("../../../dist/index").PartyServiceImpl;
var GroupServiceImpl = require("../../../dist/index").GroupServiceImpl;
var PartyGroupServiceImpl = require("../../../dist/index").PartyGroupServiceImpl;
var GroupServiceValidator = require("../../../dist/index").GroupServiceValidator;
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

	describe("When calling addItem with the correct parameters", function () {
		it("The method should insert the item", function (done) {
			var attributes = {a: "a", b: "b"};
			var item = {
				party: insertedParty4,
				attributes: attributes
			};
			partyGroupService.addItem(code, item)
				.then(function () {
					return partyGroupService.findOne(code);
				})
				.then(function (result) {
					expect(result.values.length).eq(3);
					var item = _.find(result.values, function (o) {
						return o.party.id === insertedParty4.id;
					});
					expect(item.party.id).eq(insertedParty4.id);
					expect(_.isEqual(item.attributes, attributes)).eq(true);
					done();
				});
		});
	});

	describe("When calling addItem whit an item that does not exist in the database", function () {
		it("The method should return an error", function (done) {
			var invalid = 'invalid';
			var item = {
				party: {id: invalid},
				attributes: {a: "a", b: "b"}
			};
			partyGroupService.addItem(code, item)
				.then(function () {
					expect.fail("The method should not have inserted the record");
				}, function (err) {
					expect(err.length).eq(1);
					expect(err[0].attribute).eq(PartyGroupServiceImpl.PARTY_ITEM);
					expect(err[0].message).eq(PartyGroupServiceImpl.PARTY_ITEM_DOES_NOT_EXIST);
					expect(err[0].value).eq(invalid);
					done();
				});
		});
	});

	describe("When calling addItem with a group code that does not exist in the database", function () {
		it("The method should return an error", function (done) {
			var attributes = {a: "a", b: "b"};
			var item = {
				party: insertedParty4,
				attributes: attributes
			};
			var invalid = 'invalid';
			partyGroupService.addItem(invalid, item)
				.then(function () {
					expect.fail("The method should not have inserted the record");
					done();
				}, function (err) {
					expect(err).eq(GroupServiceValidator.NO_GROUP);
					done();
				});
		});
	});

	describe("When calling addItem whit an item that exists in the group", function () {
		it("The method should return an error", function (done) {
			var attributes = {a: "a", b: "b"};
			var item = {
				party: insertedParty1,
				attributes: attributes
			};

			partyGroupService.addItem(code, item)
				.then(function () {
					expect.fail("The method should not have inserted the record");
					done();
				}, function (err) {
					expect(err.length).eq(1);
					expect(err[0].attribute).eq(PartyGroupServiceImpl.PARTY_ITEM);
					expect(err[0].message).eq(PartyGroupServiceImpl.PARTY_ITEM_DUPLICATED);
					expect(err[0].value).eq(insertedParty1.id);
					done();
				});
		});
	});


	describe("When calling removeItem with the correct values", function () {
		it("The method should remove the item", function (done) {
			partyGroupService.removeItem(code, insertedParty1.id)
				.then(function () {
					return partyGroupService.findOne(code);
				})
				.then(function (result) {
					expect(result.values.length).eq(1);
					expect(result.values[0].party.id).not.eq(insertedParty1.id);
					done();
				});
		});
	});

	describe("When removing an item that does not exist in the group", function () {
		it("The method should return an error", function (done) {
			partyGroupService.removeItem(code, insertedParty3.id)
				.then(function () {
					expect.fail("The method should have returned en error");
				}, function (err) {
					expect(err.length).eq(1);
					expect(err[0].attribute).eq(PartyGroupServiceImpl.PARTY_ITEM);
					expect(err[0].message).eq(PartyGroupServiceImpl.PARTY_ITEM_DOES_NOT_EXIST);
					expect(err[0].value).eq(insertedParty3.id);
					done();
				});
		});
	});

	describe("When calling removeItem with a group code that does not exist in the database", function () {
		it("The method should return an error", function (done) {
			var invalid = 'invalid';
			partyGroupService.removeItem(invalid, insertedParty1.id)
				.then(function () {
					expect.fail("The method should have returned en error");
				}, function (err) {
					expect(err).eq(GroupServiceValidator.NO_GROUP);
					done();
				});
		});
	});


	describe("When calling addItemNewParty with correct values", function () {
		it("The method should insert the party and associate it to the group", function (done) {
			var initialCount;
			partyDao.count()
				.then(function (result) {
					initialCount = result;
					var party = SampleData.createOrganization3();
					return partyGroupService.addItemNewParty(code, party, {});
				})
				.then(function (result) {
					expect(result.typeName).not.be.undefined;
					expect(result.id).not.be.undefined;
					expect(result.name).not.be.undefined;
					return partyDao.count();
				})
				.then(function (result) {
					expect(result).eq(initialCount + 1);
					done();
				});
		});
	});


	describe("When calling addItemNewParty with invalid group code", function () {
		it("The method should return an error", function (done) {
			var initialCount;
			partyDao.count()
				.then(function (result) {
					initialCount = result;
					var party = SampleData.createOrganization3();
					return partyGroupService.addItemNewParty('invalid code', party, {});
				})
				.then(function () {
					expect.fail("The method should not have inserted the record");
					done();
				}, function (err) {
					expect(err).eq(GroupServiceValidator.NO_GROUP);
					// make sure there is no party inserted.
					return partyDao.count()
						.then(function (result) {
							expect(result).eq(initialCount);
							done();
						});
				})
		});
	});


});

