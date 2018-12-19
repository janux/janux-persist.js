/**
 * Project janux-persistence
 * Created by ernesto on 5/26/17.
 */
"use strict";
require("bluebird");
var config = require("config");
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var lokijs = require("lokijs");
var mongoose = require("mongoose");
var ExampleUser = require("../../../dist/index").SampleUser;
var ExampleUserDaoLokiJsImpl = require("../../../dist/index").SampleUserDaoLokiJsImpl;
var ExampleUserDaoMongoDbImpl = require("../../../dist/index").SampleUserDaoMongooseImpl;
var MongoUserSchemaExample = require("../../../dist/index").MongooseUserSchemaExample;
var LokiJsAdapter = require("../../../dist/index").LokiJsAdapter;
var MongooseAdapter = require("../../../dist/index").MongooseAdapter;
var EntityProperties = require("../../../dist/index").EntityPropertiesImpl;

//Config files
var serverAppContext = config.get("serverAppContext");

//lokiJs implementation
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new LokiJsAdapter("users-example", lokiDatabase);
var userDaoLokiJS = ExampleUserDaoLokiJsImpl.createInstance(dbEngineUtilLokijs, new EntityProperties(true, true));

//Mongodb implementation
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model("users-example", MongoUserSchemaExample);
var dbEngineUtilMongodb = new MongooseAdapter(model);
var userDaoMongoDb = ExampleUserDaoMongoDbImpl.createInstance(dbEngineUtilMongodb, new EntityProperties(true, true));

const name = "John";
const email = "jon@smith.com";
const lastName = "Smith";
const name2 = "Jane";
const email2 = "jane@smith.com";
const lastName2 = "Smith";

const incorrectEmail = "johnSmith.com";

describe("Testing user example dao implementation insert methods", function() {
	[userDaoLokiJS, userDaoMongoDb].forEach(function(userDao) {
		beforeEach(function(done) {
			userDao.removeAll().then(function() {
				done();
			});
		});

		describe("When inserting an incorrect user", function() {
			it("Should send an error", function(done) {
				var user = new ExampleUser(name, lastName, incorrectEmail);
				userDao.insert(user).then(
					function(result) {
						assert.fail(result, "The system must no have inserted the user");
						done();
					},
					function(error) {
						assert("The program sent an error, is OK");
						expect(error.length).eq(1);
						done();
					}
				);
			});
		});

		describe("When inserting correctly", function() {
			it("Should the object have been inserted with the correct values", function(done) {
				var user = new ExampleUser(name, lastName, email);
				userDao.insert(user).then(
					function(result) {
						if (user instanceof ExampleUser) {
							expect(result.name).eq(name);
							expect(result.email).eq(email);
							expect(result.lastName).eq(lastName);
							expect(result.typeName).not.to.be.undefined;
							expect(result.typeName).not.to.be.null;
							expect(result).to.have.property("id");
							expect(result).to.have.property("dateCreated");
							expect(result.lastUpdate).to.be.undefined;
							expect(result.dateCreated).to.be.a("Date");

							userDao
								.findOne(result.id)
								.then(function(resultQuery) {
									expect(resultQuery.name).eq(name);
									expect(resultQuery.email).eq(email);
									expect(resultQuery.typeName).not.to.be.undefined;
									expect(resultQuery.typeName).not.to.be.null;
									expect(resultQuery.lastName).eq(lastName);
									expect(resultQuery.id).eq(result.id);
									expect(result).to.have.property("dateCreated");
									expect(result.dateCreated).to.be.a("Date");
									expect(result.lastUpdate).to.be.undefined;
									done();
								})
								.catch(function(err) {
									assert.fail(err, "The query must not have any error");
									done();
								});
						} else {
							assert.fail(true, "Object doesn't have the correct instance");
							done();
						}
					},
					function(error) {
						assert.fail(error, "The system must have inserted the object successfully");
						done();
					}
				);
			});
		});

		describe("When inserting many", function() {
			it("Should the records have been inserted correctly in the database", function(done) {
				var user = new ExampleUser(name, lastName, email);
				var user2 = new ExampleUser(name2, lastName2, email2);
				userDao.insertMany([user, user2]).then(function(result) {
					expect(result.length).eq(2);
					for (var i = 0; i < result.length; i++) {
						var obj = result[i];
						expect(obj).to.have.property("id");
						expect(obj).to.have.property("dateCreated");
					}
					done();
				});
			});
		});

		describe("When inserting duplicated data", function() {
			it("Should the method send a reject", function(done) {
				var user = new ExampleUser(name, lastName, email);
				userDao.insert(user).then(
					function(result) {
						var duplicatedUser = new ExampleUser(name, lastName, email);
						userDao.insert(duplicatedUser).then(
							function(result) {
								assert.fail(result, "The user must not be inserted");
								done();
							},
							function(error) {
								assert("The program sent an error, is OK");
								done();
							}
						);
					},
					function(error) {
						assert.fail(error, "Must be an inserted user");
						done();
					}
				);
			});
		});
	});
});
