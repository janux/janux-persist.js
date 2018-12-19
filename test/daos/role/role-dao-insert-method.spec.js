/**
 * Project janux-persistence
 * Created by alejandro on 2017-09-13.
 */
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var config = require("config");
var util = require("util");
var Role = require("janux-authorize").Role;
var AuthorizationContext = require("janux-authorize").AuthorizationContext;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const ROLE_NAME = "HUMAN_RESOURCES_MANAGER";
const ROLE_DESCR = "Can view, modify, create and delete personnel records";
const ROLE_NAME2 = "ANOTHER_ROLE";
const ROLE_DESCR2 = "Another role in the system";
const permBits = ["READ", "UPDATE", "CREATE", "TRASH", "DELETE"];

describe("Testing role dao insertMethod methods", function() {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function(dbEngine) {
		var roleDao;
		var personAuthContext;
		var accountAuthContext;

		beforeEach(function(done) {
			var path =
				dbEngine === DataSourceHandler.LOKIJS
					? serverAppContext.db.lokiJsDBPath
					: serverAppContext.db.mongoConnUrl;

			personAuthContext = AuthorizationContext.createInstance(
				"PERSON",
				"Defines permissions available on a Person entity"
			);
			accountAuthContext = AuthorizationContext.createInstance(
				"ACCOUNT",
				"Defines permissions available on an Account entity"
			);

			permBits.forEach(function(bitName) {
				personAuthContext.addPermissionBit(
					bitName,
					util.format("Grants permission to %s a %s", bitName, "PERSON")
				);
				accountAuthContext.addPermissionBit(
					bitName,
					util.format("Grants permission to %s a %s", bitName, "ACCOUNT")
				);
			});

			roleDao = DaoUtil.createRoleDao(dbEngine, path);
			roleDao.removeAll().then(function() {
				done();
			});
		});

		describe("When inserting a valid record", function() {
			it("It should have been inserted correctly", function(done) {
				var role = Role.createInstance(ROLE_NAME, ROLE_DESCR);
				role.grant(["READ", "UPDATE", "TRASH"], personAuthContext).grant(
					["READ", "UPDATE"],
					accountAuthContext
				);

				var out = role.toJSON();
				console.log(out);
				roleDao
					.insert(role)
					.then(
						function(insertedRecord) {
							//Validate the returned value
							basicInsertValidation(insertedRecord);
							//Validate the value is truly inserted
							roleDao.findOne(insertedRecord.id).then(function(resultQuery) {
								expect(resultQuery).to.have.property("id");
								expect(resultQuery.name).eq(ROLE_NAME);
								expect(resultQuery.description).eq(ROLE_DESCR);
								done();
							});
						},
						function(err) {
							assert.fail("The method should have inserted the record", err);
							done();
						}
					)
					.catch(function(err) {
						assert.fail("The method should have inserted the record", err);
						done();
					});
			});

			function basicInsertValidation(entity) {
				expect(entity).to.have.property("id");
				expect(entity.name).eq(ROLE_NAME);
				expect(entity.description).eq(ROLE_DESCR);

				expect(entity.hasPermission("READ", "PERSON")).to.equal(true);
				expect(entity.hasPermissions(["READ", "UPDATE"], "PERSON")).to.equal(true);
				expect(entity.hasPermissions(["READ", "UPDATE", "TRASH"], "PERSON")).to.equal(true);
				expect(entity.hasPermission("CREATE", "PERSON")).to.equal(false);
				expect(entity.hasPermissions(["READ", "UPDATE", "CREATE"], "PERSON")).to.equal(false);
				expect(entity.hasPermissions(["READ", "UPDATE", "CREATE", "DELETE"], "PERSON")).to.equal(false);
				expect(entity.hasPermission("READ", "ACCOUNT")).to.equal(true);
				expect(entity.hasPermissions(["READ", "UPDATE"], "ACCOUNT")).to.equal(true);
				expect(entity.hasPermission("CREATE", "ACCOUNT")).to.equal(false);
				expect(entity.hasPermissions(["READ", "UPDATE", "CREATE"], "ACCOUNT")).to.equal(false);
				expect(entity.hasPermissions(["READ", "UPDATE", "CREATE", "DELETE"], "ACCOUNT")).to.equal(false);
			}
		});

		describe("When inserting a record with a duplicated name", function() {
			it("The method should send an error", function(done) {
				var role = Role.createInstance(ROLE_NAME, ROLE_DESCR);

				roleDao.insert(role).then(function(result) {
					var role2 = Role.createInstance(ROLE_NAME, ROLE_DESCR);

					roleDao.insert(role2).then(
						function(result) {
							assert.fail("The method should not have returned an error");
							done();
						},
						function(error) {
							expect(error.length).eq(1);
							expect(error[0].attribute).eq("name");
							done();
						}
					);
				});
			});
		});

		describe("When inserting many records", function() {
			it("The method should have inserted the records", function(done) {
				var role = Role.createInstance(ROLE_NAME, ROLE_DESCR);
				var role2 = Role.createInstance(ROLE_NAME2, ROLE_DESCR2);

				roleDao
					.insertMany([role, role2])
					.then(function(result) {
						expect(result.length).eq(2);
						return roleDao.count();
					})
					.then(function(resultCount) {
						expect(resultCount).eq(2);
						done();
					});
			});
		});
	});
});
