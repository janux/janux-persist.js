var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var StaffDataEntity = require("../../../dist/index").StaffDataEntity;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const idContact1 = "1111111";
const isExternal1 = true;
const jobDepartment1 = "department 1";
const jobTitle1 = 'jobTitle 1';

const idContact2 = "2222222";
const isExternal2 = false;
const jobDepartment2 = "department 2";
const jobTitle2 = 'jobTitle 2';

const idContact3 = "333333";
const isExternal3 = false;
const jobDepartment3 = "department 3";
const jobTitle3 = 'jobTitle 3';


describe("Testing staff data dao find methods", function () {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function (dbEngine) {

		describe("Given the inserted records", function () {
			var staffDataDao;
			var insertedRecord1;
			var insertedRecord2;
			var insertedRecord3;

			function generateSampleData1() {
				var staffDataEntity = new StaffDataEntity();
				staffDataEntity.idContact = idContact1;
				staffDataEntity.isExternal = isExternal1;
				staffDataEntity.jobDepartment = jobDepartment1;
				staffDataEntity.jobTitle = jobTitle1;
				return staffDataEntity;
			}

			function generateSampleData2() {
				var staffDataEntity = new StaffDataEntity();
				staffDataEntity.idContact = idContact2;
				staffDataEntity.isExternal = isExternal2;
				staffDataEntity.jobDepartment = jobDepartment2;
				staffDataEntity.jobTitle = jobTitle2;
				return staffDataEntity;
			}

			function generateSampleData3() {
				var staffDataEntity = new StaffDataEntity();
				staffDataEntity.idContact = idContact3;
				staffDataEntity.isExternal = isExternal3;
				staffDataEntity.jobDepartment = jobDepartment3;
				staffDataEntity.jobTitle = jobTitle3;
				return staffDataEntity;
			}

			before(function (done) {
				var path = dbEngine === DataSourceHandler.LOKIJS ? serverAppContext.db.lokiJsDBPath : serverAppContext.db.mongoConnUrl;
				staffDataDao = DaoUtil.createStaffDataDao(dbEngine, path);
				staffDataDao.removeAll()
					.then(function () {
						return staffDataDao.insertMany([generateSampleData1(), generateSampleData2(), generateSampleData3()]);
					})
					.then(function (result) {
						insertedRecord1 = result[0];
						insertedRecord2 = result[1];
						insertedRecord3 = result[2];
						done();
					});
			});

			describe("When calling findByIdContact", function () {
				it("The method should return the records", function (done) {
					staffDataDao.findOneByIdContact(idContact1)
						.then(function (result) {
							expect(result.idContact).eq(idContact1);
							done();
						});
				});
			});

			describe("When calling findByIdContactIn", function () {
				it("The method should return the correct records", function (done) {
					staffDataDao.findByIdContactIn([idContact1, idContact2, "invalid"])
						.then(function (value) {
							expect(value.length).eq(2);
							done();
						});
				});
			});
		});
	});
});
