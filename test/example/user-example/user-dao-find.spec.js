/**
 * Project janux-persistence
 * Created by ernesto on 5/29/17.
 */
'use strict';
require('bluebird');
var config = require('config');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var lokijs = require('lokijs');
var mongoose = require('mongoose');
var _ = require('lodash');
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
var dbEngineUtilLokijs = new LokiJsAdapter('users-example', lokiDatabase);
var userDaoLokiJS = ExampleUserDaoLokiJsImpl.createInstance(dbEngineUtilLokijs, new EntityProperties(true, true));

//Mongodb implementation
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('users-example', MongoUserSchemaExample);
var dbEngineUtilMongodb = new MongooseAdapter(model);
var userDaoMongoDb = ExampleUserDaoMongoDbImpl.createInstance(dbEngineUtilMongodb, new EntityProperties(true, true));

const email = "jon@smith.com";
const email2 = "jane_smith@gmail.com";
const name = "John";
const lastName = "Smith";


describe("Testing user dao example find methods", function () {
	[userDaoLokiJS, userDaoMongoDb].forEach(function (userDao) {
		var insertedUsers;

		before(function (done) {
			userDao.removeAll()
				.then(function () {
					var user = new ExampleUser(name, lastName, email);
					var user2 = new ExampleUser(name, lastName, email2);
					userDao.insertMany([user, user2]).then(function (result) {
						insertedUsers = result;
						done();
					})
				});
		});

		context("Given the records in the database", function () {
			it("This query should return an array with one result", function (done) {
				userDao.findByAttributeMethod("email", email2)
					.then(function (result) {
						expect(result.length).eq(1);
						done();
					}, function (error) {
						assert.fail(error, "Error");
						done();
					})
			});

			it("This query should return an array with two results", function (done) {
				userDao.findByAttributeMethod("name", name)
					.then(function (result) {
						expect(result.length).eq(2);
						done();
					}, function (error) {
						assert.fail(error, "Error");
						done();
					})
			});

			it("This query should return one result", function (done) {
				userDao.findOneByAttributeMethod("email", email2)
					.then(function (result) {
						expect(result.email).eq(email2);
						done();
					}, function (error) {
						assert.fail(error, "Error");
						done();
					})
			});

			it("This query (findOneByAttributeMethod) should return null", function (done) {
				userDao.findOneByAttributeMethod("email", "emailTharDoesNoExits")
					.then(function (result) {
						assert.isNull(result);
						done();
					}, function (error) {
						assert.fail(error, "Error");
						done();
					});
			});

			it("This query (findOneMethod) should return null", function (done) {
				userDao.findOne("100000000000")
					.then(function (result) {
						assert.isNull(result);
						done();
					}, function (error) {
						assert.fail(error, "Error");
						done();
					});
			});

			it("This query should return a reject (the query returned two records while expecting only one)", function (done) {
				userDao.findOneByAttributeMethod("name", name)
					.then(function (result) {
						assert.fail(result, "It shouldn't have returned any value");
						done();
					}, function (error) {
						assert(error, "The program returned an error. This is OK");
						done();
					});
			});

			it("This query should return an array with two results", function (done) {
				userDao.findByAttributeNameInMethod("email", [email, email2, "anotherEmail@gmail.com"])
					.then(function (result) {
						expect(result.length).eq(2);
						done();
					}, function (error) {
						assert.fail(error, "Error");
						done();
					})
			});


			it("This query should return an array with two results", function (done) {
				var ids = _.map(insertedUsers, 'id');
				userDao.findByIdsMethod(ids)
					.then(function (result) {
						expect(result.length).eq(2);
						done();
					}, function (err) {
						assert.fail(err, "Error");
						done();
					});
			});

			it("This query should return an array with zero results", function (done) {
				userDao.findByIdsMethod(["100000000000", "200000000000"])
					.then(function (result) {
						expect(result.length).eq(0);
						done();
					}, function (err) {
						assert.fail(err, "Error");
						done();
					});

			});

			it("This query should return the value of two", function (done) {
				userDao.count()
					.then(function (result) {
						expect(result).eq(2);
						done();
					}, function (err) {
						assert.fail("Error");
						done();
					});
			});

			it("The query should return the value of two", function (done) {
				userDao.countByName(name)
					.then(function (result) {
						expect(result).eq(2);
						done();
					});
			});

			it("The query should return the value of one", function (done) {
				userDao.countByEmail(email2)
					.then(function (result) {
						expect(result).eq(1);
						done();
					});
			});
		})
	});

});

