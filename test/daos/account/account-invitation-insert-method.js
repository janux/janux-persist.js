/**
 * Project janux-persistence
 * Created by hielo on 2018-08-25.
 */
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
var AccountInvitationEntity = require("../../../dist/index").AccountInvitationEntity;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
var moment = require('moment');

//Config files
var serverAppContext = config.get("serverAppContext");

const id = "313030303030303030303030";
const code = "361827238123181";
const expire = moment().add(5, 'days').toDate();

describe("Testing accountInvitation dao insertMethod methods", function () {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {
		var accountInvitationDao;
		beforeEach(function (done) {
			var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
			accountInvitationDao = DaoUtil.createAccountInvDao(dbEngine, path);
			accountInvitationDao.removeAll()
				.then(function () {
					done();
				})
		});

		describe("When inserting a valid record", function () {
			it("It should have been inserted correctly", function (done) {
				var accountInvitation = new AccountInvitationEntity();
				accountInvitation.accountId = id
				accountInvitation.code = code;
				accountInvitation.expire = expire;
				accountInvitation.status = 'pending';

				accountInvitationDao.insert(accountInvitation)
					.then(function (insertedRecord) {
						//Validate the returned value
						basicInsertValidation(insertedRecord);
						//Validate the value is truly inserted
						accountInvitationDao.findOne(insertedRecord.id)
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
					})
			});

			function basicInsertValidation(entity) {
				expect(entity).to.have.property("id");
				expect(entity.code).eq(code);
				expect(entity.accountId).eq(id);
			}
		});

		describe("When inserting a record that has an id", function () {
			it("It should send an error", function (done) {
				var accountInvitation = new AccountInvitationEntity();
				accountInvitation.accountId = id
				accountInvitation.code = code;
				accountInvitation.expire = expire;
				accountInvitation.status = 'pending';

				accountInvitationDao.insert(accountInvitation)
					.then(function (result) {
						accountInvitationDao.insert(result)
							.then(function (result2) {
								assert.fail("It should not have inserted the record");
								done();
							}, function (err) {
								assert("The program sent an error, is ok");
								done();
							});
					});
			})
		})
	});
});
