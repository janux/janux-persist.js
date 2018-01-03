/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */

'use strict';
'use strict';
require('bluebird');
var config = require('config');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var lokijs = require('lokijs');
var mongoose = require('mongoose');
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


describe("Testing user dao example delete methods", function () {

	[userDaoLokiJS, userDaoMongoDb].forEach(function (userDao) {
		var insertedUsers;

		beforeEach(function (done) {
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

		context("Given the inserted users", function () {
			it("This method should delete all records with no problems", function (done) {
				userDao.removeAll()
					.then(function (result) {
						//Perform a query
						userDao.count()
							.then(function (count) {
								expect(count).eq(0);
								done();
							}, function (error) {
								assert.fail(error, "The method shouldn't have returned an error");
								done();
							});
					}, function (error) {
						assert.fail(error, "The method shouldn't have returned an error");
						done();
					});
			});

			it("This method should delete only one record", function (done) {
				expect(insertedUsers.length).eq(2);
				var user = insertedUsers[0];
				userDao.remove(user)
					.then(function (result) {
						userDao.count()
							.then(function (count) {
								expect(count).eq(1);
								done();
							}, function (error) {
								assert.fail(error, "The method shouldn't have returned an error");
								done();
							});
					}, function (error) {
						assert.fail(error, "The method shouldn't have returned an error");
						done();
					})
			});

			it("This method should delete only one record", function (done) {
				expect(insertedUsers.length).eq(2);
				var user = insertedUsers[0];
				userDao.removeById(user.id)
					.then(function (result) {
						userDao.count()
							.then(function (count) {
								expect(count).eq(1);
								done();
							}, function (error) {
								assert.fail(error, "The method shouldn't have returned an error");
								done();
							});
					}, function (error) {
						assert.fail(error, "The method shouldn't have returned an error");
						done();
					})
			})
		});
	});
});
