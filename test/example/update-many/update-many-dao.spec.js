/*
 * Project janux-persist.js
 * Created by ernesto on 2/19/19
 */

var TickerEntity = require("../../../dist").TickerEntity;
var TickerMongooseSchema = require("../../../dist").TickerMongooseSchema;
var TickerDao = require("../../../dist").TickerDao;

var _ = require("lodash");
var chai = require("chai");
var config = require("config");
var expect = chai.expect;
var mongoose = require("mongoose");
var MongooseAdapter = require("../../../dist/index").MongooseAdapter;
var EntityProperties = require("../../../dist/index").EntityPropertiesImpl;

//Config files
var serverAppContext = config.get("serverAppContext");

//Mongodb implementation
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model("ticker-example", TickerMongooseSchema);
var dbEngineUtilMongodb = new MongooseAdapter(model);
var tickerDao = new TickerDao(dbEngineUtilMongodb, EntityProperties.createDefaultProperties());

const names = ["name 1", "name 2", "name 3"];

const namesToUpdate = ["name 4", "name 5"];

describe("Testing ticker dao update many method", function() {
	var insertedName1;
	var insertedName2;
	var insertedName3;
	beforeEach(function(done) {
		tickerDao
			.removeAll()
			.then(function() {
				const valuesToInsert = _.map(names, function(value) {
					const result = new TickerEntity();
					result.name = value;
					return result;
				});
				return tickerDao.insertMany(valuesToInsert);
			})
			.then(function(result) {
				insertedName1 = _.find(result, function(value) {
					return value.name === names[0];
				});
				insertedName2 = _.find(result, function(value) {
					return value.name === names[1];
				});
				insertedName3 = _.find(result, function(value) {
					return value.name === names[2];
				});
				done();
			});
	});

	describe("When calling update many with the correct values", function() {
		it("The method should update the values", function(done) {
			insertedName1.name = namesToUpdate[0];
			insertedName2.name = namesToUpdate[1];
			tickerDao
				.updateMany([insertedName1, insertedName2])
				.then(function() {
					return tickerDao.findAll();
				})
				.then(function(result) {
					expect(result.length).eq(3);
					for (var i = 0; i < namesToUpdate.length; i++) {
						const name = namesToUpdate[i];
						var entity = _.find(result, function(value) {
							return value.name === name;
						});
						expect(entity).not.to.be.undefined;
					}
					done();
				});
		});
	});

	describe("When calling update many with the correct values", function() {
		it("The method should update the values", function(done) {
			insertedName1.name = insertedName3.name;
			insertedName2.name = namesToUpdate[0];
			insertedName3.name = namesToUpdate[1];
			tickerDao
				.updateMany([insertedName1, insertedName2, insertedName3])
				.then(function() {
					return tickerDao.findAll();
				})
				.then(function(result) {
					done();
				});
		});
	});

	describe("When calling update many with incorrect values", function() {
		it("The method should return an error", function(done) {
			insertedName1.name = insertedName3.name;
			insertedName2.name = namesToUpdate[0];
			tickerDao.updateMany([insertedName1, insertedName2]).then(
				function() {
					expect.fail("The method should not have updated the record");
				},
				function(error) {
					expect(error.length).eq(1);
					done();
				}
			);
		});
	});
});
