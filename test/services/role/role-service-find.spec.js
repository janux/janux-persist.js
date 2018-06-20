/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-13
 */
var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var Role = require("janux-authorize").Role;
var RoleService = require("../../../dist/index").RoleService;
var DaoUtil = require("../../daos/dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var serverAppContext = config.get("serverAppContext");
var dbEngine = serverAppContext.db.dbEngine;

const ROLE_NAME = 'HUMAN_RESOURCES_MANAGER';
const ROLE_DESCR = 'Can view, modify, create and delete personnel records';
const ROLE_NAME2 = 'ANOTHER_ROLE';
const ROLE_DESCR2 = 'Another role in the system';
const name3 = 'NOTEXISTS';
const invalidId = "313030303030303030300000";

describe("Testing role service find methods", function () {

	describe("Given the inserted records", function () {

		var insertedId;
		var roleDao;
		var roleService;

		beforeEach(function (done) {
			var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
			roleDao = DaoUtil.createRoleDao(dbEngine, path);
			roleService = RoleService.createInstance(roleDao);

			roleDao.removeAll()
				.then(function () {
					var role1 = Role.createInstance(ROLE_NAME, ROLE_DESCR);
					var role2 = Role.createInstance(ROLE_NAME2, ROLE_DESCR2);
					return roleDao.insertMany([role1, role2])
				})
				.then(function (result) {
					insertedId = result[0].id;
					done();
				});
		});

		describe("When looking for a role by name", function () {
			it("It should return one record", function (done) {
				roleService.findOneByName(ROLE_NAME)
					.then(function (result) {
						expect(result).not.to.be.null;
						expect(result.name).eq(ROLE_NAME);
						expect(result.description).eq(ROLE_DESCR);
						done();
					})
			});
		});

		describe("When looking for an incorrect name", function () {
			it("It should return null", function (done) {
				roleService.findOneByName(name3)
					.then(function (result) {
						// expect(result).to.be.null;
						// done();
					}).catch(function (err) {
					expect(err).not.to.be.null;
					done();
				});
			});
		});

		describe("When looking for an id", function () {
			it("It should return one record", function (done) {
				roleService.findOneById(insertedId)
					.then(function (result) {
						expect(result).not.to.be.null;
						done();
					})
			});
		});

		describe("When looking for an id that doesn't exist in the database", function () {
			it("It should return null", function (done) {
				roleService.findOneById(invalidId)
					.then(function (result) {
						// expect(result).to.be.null;
						// done();
					}).catch(function (err) {
					expect(err).not.to.be.null;
					done();
				});
			});
		});

		describe("When calling findOneByNameIn", function () {
			it("The method should return the correct records", function (done) {
				roleService.findByNameIn([ROLE_NAME, ROLE_NAME2])
					.then(function (value) {
						expect(value.length).eq(2);
						done();
					});
			});
		});


	});

});
