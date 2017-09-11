/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var AuthorizationContext = require("janux-authorize").AuthorizationContext;
var DaoFactory = require("../../../dist/index").DaoFactory;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const name = 'PERSON';
const name2 = 'WIDGET';
const description = 'Defines permissions available on a Person entity';
const description2 =  'Widget that we want to track in our system';
const name3 = 'NOTEXISTS';
const invalidId = "313030303030303030300000";

describe("Testing authorization context dao find methods", function () {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {

		describe("Given the inserted records", function () {

			var insertedId;
			var insertedId2;
			var authContextDao;
			beforeEach(function (done) {
				var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
				authContextDao = DaoFactory.createAuthContextDao(dbEngine, path);
				authContextDao.removeAll()
					.then(function () {
						var authContext1 = AuthorizationContext.createInstance(name, description);
						var authContext2 = AuthorizationContext.createInstance(name2, description2);
						return authContextDao.insertMany([authContext1, authContext2])
					})
					.then(function (result) {
						insertedId = result[0].id;
						insertedId2 = result[1].id;
						done();
					});
			});

			describe("When looking for an authorization context by name", function () {
				it("It should return one record", function (done) {
					authContextDao.findOneByName(name)
						.then(function (result) {
							expect(result).not.to.be.null;
							expect(result.name).eq(name);
							expect(result.description).eq(description);
							done();
						})
				});
			});

			describe("When looking for an incorrect name", function () {
				it("It should return null", function (done) {
					authContextDao.findOneByName(name3)
						.then(function (result) {
							expect(result).to.be.null;
							done();
						})
				});
			});

			describe("When looking for an id in the database", function () {
				it("It should return one record", function (done) {
					authContextDao.findOne(insertedId)
						.then(function (result) {
							expect(result).not.to.be.null;
							done();
						})
				});
			});

			describe("When looking for an id that doesn't exist in the database", function () {
				it("It should return null", function (done) {
					authContextDao.findOne(invalidId)
						.then(function (result) {
							expect(result).to.be.null;
							done();
						})
				});
			});

			describe("When looking for several id-s (correct and incorrect)", function () {
				it("It should return an array", function (done) {
					authContextDao.findByIdsMethod([insertedId, insertedId2])
						.then(function (result) {
							expect(result.length).eq(2);
							done();
						})
				});

				it("It should return an array with ony one result", function (done) {
					authContextDao.findByIdsMethod([insertedId, invalidId])
						.then(function (result) {
							expect(result.length).eq(1);
							done();
						})
				});

				it("It should return an empty array", function (done) {
					authContextDao.findByIdsMethod([invalidId])
						.then(function (result) {
							expect(result.length).eq(0);
							done();
						})
				})
			});

			describe("When counting", function () {
				it("Should return 2", function (done) {
					authContextDao.count()
						.then(function (result) {
							expect(result).eq(2);
							done();
						})
				})
			});
		});
	});
});
