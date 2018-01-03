/**
 * Project glarus-services
 * Created by ernesto on 1/3/18.
 */




var BigDecimalEntity = require("../../../dist").BigDecimalEntity;
var BigDecimalMongooseSchema = require("../../../dist").BigDecimalMongooseSchema;
var BigDecimalDaoMongoose = require("../../../dist").BigDecimalDaoMongoose;
var BigDecimalDaoLokijs = require("../../../dist").BigDecimalDaoLokijs;
var Big = require('big.js');
var config = require('config');
var chai = require('chai');
var expect = chai.expect;
var lokijs = require('lokijs');
var mongoose = require('mongoose');
var LokiJsAdapter = require("../../../dist/index").LokiJsAdapter;
var MongooseAdapter = require("../../../dist/index").MongooseAdapter;
var EntityProperties = require("../../../dist/index").EntityPropertiesImpl;

//Config files
var serverAppContext = config.get("serverAppContext");

//lokiJs implementation
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new LokiJsAdapter('big-decimal-example', lokiDatabase);
var bigDecimalLokijs = new BigDecimalDaoLokijs(dbEngineUtilLokijs, EntityProperties.createDefaultProperties());

//Mongodb implementation
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('big-decimal-example', BigDecimalMongooseSchema);
var dbEngineUtilMongodb = new MongooseAdapter(model);
var bigDecimalMongoDb = new BigDecimalDaoMongoose(dbEngineUtilMongodb, EntityProperties.createDefaultProperties());

const name = "name";
// We cant make this number too big because there is a precision loss with the lokijs implementation.
const veryBigNumber = "99.999999";
const value = new Big(veryBigNumber);

describe("Testing big decimal dao insert method", function () {
	[bigDecimalLokijs, bigDecimalMongoDb].forEach(function (bigDecimalDao) {

		beforeEach(function (done) {
			bigDecimalDao.removeAll()
				.then(function () {
					done();
				});
		});

		function validate(value) {
			expect(value.name).eq(name);
			expect(value.value.toFixed(6)).eq(veryBigNumber);
		}

		describe("When calling insert", function () {
			it("The method should insert the record", function (done) {
				var bigDecimal = new BigDecimalEntity();
				bigDecimal.name = name;
				bigDecimal.value = value;
				bigDecimalDao.insert(bigDecimal)
					.then(function (result) {
						validate(result);
						// Validate a query.
						return bigDecimalDao.findOne(result.id);
					})
					.then(function (result) {
						validate(result);
						done();
					});
			});
		});

	});
});
