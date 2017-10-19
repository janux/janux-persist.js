/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var AuthorizationContext = require("janux-authorize").AuthorizationContext;
var AuthContextService = require("../../../dist/index").AuthContextService;
var DaoUtil = require("../../daos/dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

const name = 'PERSON';
const name2 = 'WIDGET';
const description = 'Defines permissions available on a Person entity';
const description2 =  'Widget that we want to track in our system';
const newDescription =  'New authorization context description';

describe("Testing authorization context service update method", function () {

	var insertedRecord1;
	var authContextDao;
	var authContextService;

	beforeEach(function (done) {
		authContextDao = DaoUtil.createAuthContextDao(dbEngine, dbPath);
		authContextService = AuthContextService.createInstance(authContextDao);

		// Wait for lokijs to initialize
		setTimeout(function () {

			authContextDao.removeAll()
				.then(function () {
					var authContext1 = AuthorizationContext.createInstance(name, description);
					var authContext2 = AuthorizationContext.createInstance(name2, description2);
					return authContextDao.insertMany([authContext1, authContext2])
				})
				.then(function (result) {
					insertedRecord1 = result[0];
					done();
				});
		}, 50);

	});

	describe("When updating an authorization context", function () {
		it("It should not return any error", function (done) {

			insertedRecord1.description = newDescription;

			authContextService.update(insertedRecord1)
				.then(function (result) {
					//Perform a query with the same id.
					return authContextDao.findOne(insertedRecord1.id);
				})
				.then(function (resultQuery) {
					expect(resultQuery.id).eq(insertedRecord1.id);
					expect(resultQuery.description).eq(newDescription);
					done();
				});
		});
	});

	describe("When updating an authorization context with a duplicated name", function () {
		it("The method should return an error", function (done) {

			insertedRecord1.name = name2; // already exists

			authContextService.update(insertedRecord1)
				.then(function (result) {
					//Perform a query with the same id.
					return authContextDao.findOne(insertedRecord1.id);
				})
				.catch(function (err) {
					expect(err.length).eq(1);
					expect(err[0].attribute).eq("name");
					done();
				});
		});
	});
});
