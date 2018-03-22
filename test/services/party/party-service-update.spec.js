var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var serverAppContext = config.get("serverAppContext");
var PartyService = require("../../../dist/index").PartyServiceImpl;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var DaoUtil = require("../../daos/dao-util");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var SampleData = require("../../util/sample-data");
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

describe("Testing partyService update method", function () {

	var partyDao;
	var staffDao;
	var partyService;

	var insertedPerson1;
	var insertedPerson2;
	var insertedPerson3;
	var insertedPerson4;

	before(function (done) {
		partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
		staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
		partyService = new PartyService(partyDao, staffDao);
		partyService.removeAll()
			.then(function () {
				var party1 = SampleData.createPerson1();
				var party2 = SampleData.createPerson2();
				var party3 = SampleData.createOrganization1();
				var party4 = SampleData.createOrganization2();
				return partyService.insertMany([party1, party2, party3, party4]);
			})
			.then(function (result) {
				insertedPerson1 = result[0];
				insertedPerson2 = result[1];
				insertedPerson3 = result[2];
				insertedPerson4 = result[3];
				done();
			});
	});


	describe("When calling update", function () {
		it("The method should update the record", function (done) {
			const updatedName = "updatedName";
			insertedPerson1.staff.isExternal = false;
			insertedPerson1.name.first = updatedName;
			partyService.update(insertedPerson1)
				.then(function (result) {
					expect(result.staff.isExternal).eq(false);
					expect(result.name.first).eq(updatedName);
					return partyDao.findOne(insertedPerson1.id);
				})
				.then(function (result) {
					expect(result.name.first).eq(updatedName);
					return staffDao.findOneByIdContact(insertedPerson1.id);
				})
				.then(function (result) {
					expect(result.isExternal).eq(false);
					done();
				});
		});
	});
});
