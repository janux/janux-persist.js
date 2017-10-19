/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-13
 */

var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var Role = require("janux-authorize").Role;
var DaoUtil = require("../../daos/dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
//Config files
var serverAppContext = config.get("serverAppContext");

const ROLE_NAME = 'HUMAN_RESOURCES_MANAGER';
const ROLE_DESCR = 'Can view, modify, create and delete personnel records';
const ROLE_NAME2 = 'ANOTHER_ROLE';
const ROLE_DESCR2 = 'Another role in the system';

describe("Testing role dao delete methods", function () {

	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
		describe("Given the inserted records", function () {

			var role;
			var role2;
			var roleDao;
			beforeEach(function (done) {
				var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;

				roleDao = DaoUtil.createRoleDao(dbEngine, path);

				// Wait for lokijs to initialize
				setTimeout(function () {

					role = Role.createInstance(ROLE_NAME, ROLE_DESCR);
					role2 = Role.createInstance(ROLE_NAME2, ROLE_DESCR2);

					roleDao.insertMany([role, role2])
						.then(function (res) {
							role = res[0];
							role2 = res[1];
							done();
						});
				}, 50);
			});

			describe("When calling removeAll", function () {
				it("It should delete all records", function (done) {
					roleDao.removeAll()
						.then(function () {
							return roleDao.count();
						})
						.then(function (result) {
							expect(result).eq(0);
							done();
						});
				})
			});

			describe("When deleting one record", function () {
				it("It should delete it", function (done) {
					roleDao.remove(role)
						.then(function () {
							return roleDao.count();
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
