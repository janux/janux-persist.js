/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */

var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var AuthorizationContext = require("janux-authorize").AuthorizationContext;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
//Config files
var serverAppContext = config.get("serverAppContext");

const name = 'PERSON';
const name2 = 'WIDGET';
const description = 'Defines permissions available on a Person entity';
const description2 =  'Widget that we want to track in our system';

describe("Testing authorization context dao delete methods", function () {

	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
		describe("Given the inserted records", function () {

			var authContext;
			var authContext2;
			var authContextDao;
			beforeEach(function (done) {
				var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;

				authContextDao = DaoUtil.createAuthContextDao(dbEngine, path);

				// Wait for lokijs to initialize
				setTimeout(function () {

					authContext = AuthorizationContext.createInstance(name, description);
					authContext2 = AuthorizationContext.createInstance(name, description);

					authContextDao.insertMany([authContext, authContext2])
						.then(function (res) {
							authContext = res[0];
							authContext2 = res[1];
							done();
						});
				}, 50);
			});

			describe("When calling removeAll", function () {
				it("It should delete all records", function (done) {
					authContextDao.removeAll()
						.then(function () {
							return authContextDao.count();
						})
						.then(function (result) {
							expect(result).eq(0);
							done();
						});
				})
			});

			describe("When deleting one record", function () {
				it("It should delete it", function (done) {
					authContextDao.remove(authContext)
						.then(function () {
							return authContextDao.count();
						})
						.then(function (result) {
							expect(result).eq(1);
							done();
						});
				})
			});

		});
	})
});
