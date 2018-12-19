var chai = require("chai");
var expect = chai.expect;
var config = require("config");
var StaffDataEntity = require("../../../dist/index").StaffDataEntity;
var StaffDataEntityValidator = require("../../../dist/index").StaffDataEntityValidator;
var DaoUtil = require("../dao-util");
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

//Config files
var serverAppContext = config.get("serverAppContext");

const idContact1 = "1111111";
const isExternal1 = true;
const jobDepartment1 = "department 1";
const jobTitle1 = "jobTitle 1";

const updatedIdContact1 = "1111111b";
const updatedIsExternal1 = false;
const updatedJobDepartment1 = "department updated";
const updatedJobTitle1 = "jobTitle updated";

const idContact2 = "2222222";
const isExternal2 = false;
const jobDepartment2 = "department 2";
const jobTitle2 = "jobTitle 2";

const idContact3 = "333333";
const isExternal3 = false;
const jobDepartment3 = "department 3";
const jobTitle3 = "jobTitle 3";

describe("Testing staff data dao update methods", function() {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function(dbEngine) {
		describe("Given the inserted records", function() {
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

			before(function(done) {
				var path =
					dbEngine === DataSourceHandler.LOKIJS
						? serverAppContext.db.lokiJsDBPath
						: serverAppContext.db.mongoConnUrl;
				staffDataDao = DaoUtil.createStaffDataDao(dbEngine, path);
				staffDataDao
					.removeAll()
					.then(function() {
						return staffDataDao.insertMany([
							generateSampleData1(),
							generateSampleData2(),
							generateSampleData3()
						]);
					})
					.then(function(result) {
						insertedRecord1 = result[0];
						insertedRecord2 = result[1];
						insertedRecord3 = result[2];
						done();
					});
			});

			describe("When calling update with the correct values", function() {
				it("The method should insert the record", function(done) {
					insertedRecord1.idContact = updatedIdContact1;
					insertedRecord1.isExternal = updatedIsExternal1;
					insertedRecord1.jobTitle = updatedJobTitle1;
					insertedRecord1.jobDepartment = updatedJobDepartment1;
					staffDataDao.update(insertedRecord1).then(function(result) {
						expect(result.id).eq(insertedRecord1.id);
						expect(result.isExternal).eq(updatedIsExternal1);
						expect(result.jobTitle).eq(updatedJobTitle1);
						expect(result.jobDepartment).eq(updatedJobDepartment1);
						done();
					});
				});
			});

			describe("When calling update by setting the person to an existing record", function() {
				it("The method should return an error", function(done) {
					insertedRecord1.idContact = idContact2;
					insertedRecord1.isExternal = updatedIsExternal1;
					insertedRecord1.jobTitle = updatedJobTitle1;
					insertedRecord1.jobDepartment = updatedJobDepartment1;
					staffDataDao.update(insertedRecord1).then(
						function() {
							expect.fail("The method not have updated the record");
							done();
						},
						function(err) {
							expect(err.length).eq(1);
							expect(err[0].attribute).eq(StaffDataEntityValidator.ID_CONTACT);
							expect(err[0].message).eq(StaffDataEntityValidator.ID_CONTACT_DUPLICATED);
							expect(err[0].value).eq(idContact2);
							done();
						}
					);
				});
			});
		});
	});
});
