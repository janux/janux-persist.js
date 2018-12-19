/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */
var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var AuthorizationContext = require("janux-authorize").AuthorizationContext;
var AuthContextService = require("../../../dist/index").AuthContextService;
var DaoUtil = require("../../daos/dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var serverAppContext = config.get("serverAppContext");
var dbEngine = serverAppContext.db.dbEngine;

const name = "PERSON";
const name2 = "WIDGET";
const description = "Defines permissions available on a Person entity";
const description2 = "Widget that we want to track in our system";
const name3 = "NOTEXISTS";
const invalidId = "313030303030303030300000";

describe("Testing authorization context service find methods", function() {
	describe("Given the inserted records", function() {
		var insertedId;
		var authContextDao;
		var authContextService;

		beforeEach(function(done) {
			var path =
				dbEngine === DataSourceHandler.LOKIJS
					? serverAppContext.db.lokiJsDBPath
					: serverAppContext.db.mongoConnUrl;
			authContextDao = DaoUtil.createAuthContextDao(dbEngine, path);
			authContextService = AuthContextService.createInstance(authContextDao);

			authContextDao
				.removeAll()
				.then(function() {
					var authContext1 = AuthorizationContext.createInstance(name, description);
					var authContext2 = AuthorizationContext.createInstance(name2, description2);
					return authContextDao.insertMany([authContext1, authContext2]);
				})
				.then(function(result) {
					insertedId = result[0].id;
					done();
				});
		});

		describe("When looking for an authorization context by name", function() {
			it("It should return one record", function(done) {
				authContextService.findOneByName(name).then(function(result) {
					expect(result).not.to.be.null;
					expect(result.name).eq(name);
					expect(result.description).eq(description);
					done();
				});
			});
		});

		describe("When looking for an incorrect name", function() {
			it("It should return null", function(done) {
				authContextService
					.findOneByName(name3)
					.then(function(result) {
						// expect(result).to.be.null;
						// done();
					})
					.catch(function(err) {
						expect(err).not.to.be.null;
						done();
					});
			});
		});

		describe("When looking for an id", function() {
			it("It should return one record", function(done) {
				authContextService.findOneById(insertedId).then(function(result) {
					expect(result).not.to.be.null;
					done();
				});
			});
		});

		describe("When looking for an id that doesn't exist in the database", function() {
			it("It should return null", function(done) {
				authContextService
					.findOneById(invalidId)
					.then(function(result) {
						// expect(result).to.be.null;
						// done();
					})
					.catch(function(err) {
						expect(err).not.to.be.null;
						done();
					});
			});
		});
	});
});
