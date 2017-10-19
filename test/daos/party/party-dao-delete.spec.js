/**
 * Project janux-persistence
 * Created by ernesto on 6/23/17.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var lokijs = require('lokijs');
var mongoose = require('mongoose');

var PersonEntity = require("janux-people").Person;
var OrganizationEntity = require("janux-people").Organization;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const idAccount = "313030303030303030303037";
const firstName = "John";
const middleName = "Doe";
const lastName = "Iglesias";
const displayName = "displayName";
const honorificPrefix = "honorificPrefix";
const honorificSuffix = "honorificSuffix";
const work = "work";
const home = "home";

const organizationName = "Glarus";
const organizationName2 = "Glarus 2";

const name2 = "Jane";
const middleName2 = "Smith";

describe("Testing party dao delete methods", function () {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
		describe("Given the inserted records", function () {
			var partyDao;
			var insertedRecordOrganization;
			var insertedRecordPerson;
			var insertedRecordOrganization2;
			var insertedRecordPerson2;

			beforeEach(function (done) {
				var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
				partyDao = DaoUtil.createPartyDao(dbEngine, path)
				partyDao.removeAll()
					.then(function () {
						var organization = new OrganizationEntity();
						organization.idAccount = idAccount;
						organization.name = organizationName;

						var person = new PersonEntity();
						person.name.first = firstName;
						person.name.middle = middleName;
						person.name.last = lastName;

						var organization2 = new OrganizationEntity();
						organization2.name = organizationName2;

						var person2 = new PersonEntity();
						person2.name.first = name2;
						person2.name.middle = middleName2;

						return partyDao.insertMany([organization, person, organization2, person2])
					})
					.then(function (result) {
						insertedRecordOrganization = result[0];
						insertedRecordPerson = result[1];
						insertedRecordOrganization2 = result[2];
						insertedRecordPerson2 = result[3];
						done();
					})
					.catch(function (err) {
						assert.fail("Error", err);
						done();
					})
			});

			describe("When calling delete all", function () {
				it("It should delete all records", function (done) {
					partyDao.removeAll()
						.then(function () {
							return partyDao.count();
						})
						.then(function (count) {
							expect(count).eq(0);
							done();
						});
				});
			});

			describe("When deleting one record", function () {
				it("It should delete it", function (done) {
					partyDao.remove(insertedRecordOrganization)
						.then(function () {
							return partyDao.count();
						})
						.then(function (count) {
							expect(count).eq(3);
							done();
						});
				});
			});

		});
	});
});
