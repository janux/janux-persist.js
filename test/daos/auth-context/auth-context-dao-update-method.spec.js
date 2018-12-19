/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var config = require("config");
var AuthorizationContext = require("janux-authorize").AuthorizationContext;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

const name = "PERSON";
const name2 = "WIDGET";
const description = "Defines permissions available on a Person entity";
const description2 = "Widget that we want to track in our system";
const newDescription = "New authorization context description";

//Config files
var serverAppContext = config.get("serverAppContext");

describe("Testing authorization context dao update methods", function() {
	[DataSourceHandler.LOKIJS, DataSourceHandler.MONGOOSE].forEach(function(dbEngine) {
		describe("Given the inserted records", function() {
			var authContextDao;
			var insertedRecord1;
			var insertedRecord2;

			beforeEach(function(done) {
				var path =
					dbEngine === DataSourceHandler.LOKIJS
						? serverAppContext.db.lokiJsDBPath
						: serverAppContext.db.mongoConnUrl;
				authContextDao = DaoUtil.createAuthContextDao(dbEngine, path);
				authContextDao
					.removeAll()
					.then(function() {
						var authContext1 = AuthorizationContext.createInstance(name, description);
						var authContext2 = AuthorizationContext.createInstance(name2, description2);

						return authContextDao.insertMany([authContext1, authContext2]);
					})
					.then(function(result) {
						insertedRecord1 = result[0];
						insertedRecord2 = result[1];
						done();
					});
			});

			describe("When updating an authorization context", function() {
				it("It should not send an error", function(done) {
					insertedRecord1.description = newDescription;
					authContextDao
						.update(insertedRecord1)
						.then(function(res) {
							//Perform a query with the same id.
							return authContextDao.findOne(insertedRecord1.id);
						})
						.then(function(resultQuery) {
							expect(resultQuery.id).eq(insertedRecord1.id);
							expect(resultQuery.description).eq(newDescription);
							done();
						})
						.catch(function(err) {
							expect.fail("Error");
							done();
						});
				});
			});

			describe("When updating an authorization context without an id", function() {
				it("It should return an error", function(done) {
					var authContext = AuthorizationContext.createInstance(name, description);
					authContextDao.update(authContext).then(
						function(res) {
							assert.fail("The method should not have updated the record");
							done();
						},
						function(err) {
							assert("The method sent an error, is ok", err);
							done();
						}
					);
				});
			});

			describe("When updating an authorization context with a duplicated name", function() {
				it("It should send an error", function(done) {
					insertedRecord1.name = name2;
					authContextDao.update(insertedRecord1).then(
						function(res) {
							assert.fail("The method should not have updated the record");
							done();
						},
						function(err) {
							assert("The method sent an error, is ok", err);
							expect(err.length).eq(1);
							expect(err[0].attribute).eq("name");
							done();
						}
					);
				});
			});
		});
	});
});
