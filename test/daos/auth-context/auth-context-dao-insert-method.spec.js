/**
 * Project janux-persistence
 * Created by alejandro on 2017-09-06.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
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

describe("Testing authorization context dao insertMethod methods", function () {

	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {

		var authContextDao;

		beforeEach(function (done) {
			var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;

			authContextDao = DaoFactory.createAuthContextDao(dbEngine, path);
			authContextDao.removeAll()
				.then(function () {
					done();
				});
		});

		describe("When inserting a valid record", function () {
			it("It should have been inserted correctly", function (done) {

				var authContext = AuthorizationContext.createInstance(name, description);
				// Add a permission bit
				authContext.addPermissionBit('READ', 'Grants permission to READ a PERSON');

				// Add a permission bit providing the name. Optionally description and sortOrder.
				authContext.addPermissionBit('UPDATE', 'Grants permission to UPDATE a PERSON', 99);

				authContextDao.insert(authContext)
					.then(function (insertedRecord) {
						//Validate the returned value
						basicInsertValidation(insertedRecord);
						//Validate the value is truly inserted
						authContextDao.findOne(insertedRecord.id)
							.then(function (resultQuery) {
								basicInsertValidation(resultQuery);
								done();
							})
					}, function (err) {
						assert.fail("The method should have inserted the record", err);
						done();
					})
					.catch(function (err) {
						assert.fail("The method should have inserted the record", err);
						done();
					});
			});

			function basicInsertValidation(entity) {
				expect(entity).to.have.property("id");
				expect(entity.name).eq(name);
				expect(entity.description).eq(description);

				var bit = entity.permissionBit('UPDATE');

				expect(bit.name).to.equal('UPDATE');
				expect(bit.label).to.equal('UPDATE');
			}
		});

		describe("When inserting a record with a duplicated name", function () {
			it("The method should send an error", function (done) {
				var authContext = AuthorizationContext.createInstance(name, description);

				authContextDao.insert(authContext)
					.then(function (result) {
						var authContext2 = AuthorizationContext.createInstance(name, description);

						authContextDao.insert(authContext2)
							.then(function (result) {
								assert.fail("The method should not have returned an error");
								done();
							}, function (error) {
								expect(error.length).eq(1);
								expect(error[0].attribute).eq("name");
								done();
							})
					});
			});
		});
		
		describe("When inserting many records", function () {
			it("The method should have inserted the records", function (done) {

				var authContext = AuthorizationContext.createInstance(name, description);
				var authContext2 = AuthorizationContext.createInstance(name2, description2);

				authContextDao.insertMany([authContext, authContext2])
					.then(function (result) {
						expect(result.length).eq(2);
						return authContextDao.count()
					})
					.then(function (resultCount) {
						expect(resultCount).eq(2);
						done();
					});
			});
		});
	});
});
