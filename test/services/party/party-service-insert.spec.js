var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var serverAppContext = config.get("serverAppContext");
var PartyService = require("../../../dist/index").PartyServiceImpl;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var DaoUtil = require("../../daos/dao-util");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var SampleData = require("../../util/sample-data");
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

describe("Testing partyService insert method", function() {
	var partyDao;
	var staffDao;
	var partyService;

	before(function(done) {
		partyDao = DaoUtil.createPartyDao(dbEngine, dbPath);
		staffDao = DaoUtil.createStaffDataDao(dbEngine, dbPath);
		partyService = new PartyService(partyDao, staffDao);
		partyService.removeAll().then(function() {
			done();
		});
	});

	describe("When inserting a contact with the correct data", function() {
		it("The method should insert the person in the database", function(done) {
			var person = SampleData.createPerson1();
			var insertedPerson;
			partyService
				.insert(person)
				.then(function(result) {
					insertedPerson = result;
					expect(result.id).not.to.be.undefined;
					expect(result.staff).not.to.be.undefined;
					return partyDao.findOne(insertedPerson.id);
				})
				.then(function(result) {
					expect(result).not.to.be.undefined;
					return staffDao.findOneByIdContact(insertedPerson.id);
				})
				.then(function(result) {
					expect(result).not.to.be.undefined;
					done();
				});
		});
	});
});
