/**
 * Project janux-persistence
 * Created by alejandro janux 2017-09-07
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var AuthContextService = require("../../../dist/index").AuthContextService;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var AuthContextValidator = require("../../../dist/index").AuthContextValidator;
var DaoUtil = require("../../daos/dao-util");
var authContextSample = require('./auth-context.json');
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var dbPath = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

const name = 'PERSON';
const description = 'Defines permissions available on a Person entity';

describe("Testing authorization context service insert method", function () {

	var authContextDao;
	var authContextService;

	beforeEach(function (done) {
		authContextDao = DaoUtil.createAuthContextDao(dbEngine, dbPath);
		authContextService = AuthContextService.createInstance(authContextDao);
		authContextDao.removeAll()
			.then(function () {
				done();
			});
	});


	describe("When inserting an authorization context", function () {
		it("It should not return any error", function (done) {

			authContextService.insert(authContextSample[0])
				.then(function (resultInsert) {
					return authContextService.findOneById(resultInsert.id);
				}).then(function (result) {
					expect(result.id).not.to.be.undefined;
					expect(result.name).eq(name);
					expect(result.description).eq(description);

					var bit = result.permissionBit('READ');

					// expect(bit).to.be.instanceof(PermissionBit);
					expect(bit.name).to.equal('READ');
					expect(bit.label).to.equal('READ');
					expect(bit.position).to.equal(0);
					expect(bit.sortOrder).to.equal(0);

					done();
				});
		});
	});

	describe("When inserting an authorization context with a duplicated name", function () {
		it("The method should return an error", function (done) {

			authContextService.insert(authContextSample[0])
				.then(function (result) {
					return authContextService.insert(authContextSample[0]);
				}).then(function (result2) {
					expect.fail("The method should not have inserted the record");
					done();
				})
				.catch(function (err) {
					expect(err.length).eq(1);
					expect(err[0].message).eq(AuthContextValidator.ANOTHER_NAME);
					done();
				});
		})
	});
});
