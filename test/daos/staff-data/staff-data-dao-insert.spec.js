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

describe("Testing staff data dao insert methods", function() {
	[DataSourceHandler.MONGOOSE, DataSourceHandler.LOKIJS].forEach(function(dbEngine) {
		describe("Given the inserted records", function() {
			var staffDataDao;

			function generateSampleData1() {
				var staffDataEntity = new StaffDataEntity();
				staffDataEntity.idContact = idContact1;
				staffDataEntity.isExternal = isExternal1;
				staffDataEntity.jobDepartment = jobDepartment1;
				staffDataEntity.jobTitle = jobTitle1;
				return staffDataEntity;
			}

			function validateData(result) {
				expect(result.id).not.to.be.undefined;
				expect(result.isExternal).eq(isExternal1);
				expect(result.idContact).eq(idContact1);
				expect(result.jobTitle).eq(jobTitle1);
				expect(result.jobDepartment).eq(jobDepartment1);
			}

			before(function(done) {
				var path =
					dbEngine === DataSourceHandler.LOKIJS
						? serverAppContext.db.lokiJsDBPath
						: serverAppContext.db.mongoConnUrl;
				staffDataDao = DaoUtil.createStaffDataDao(dbEngine, path);
				staffDataDao.removeAll().then(function() {
					done();
				});
			});

			describe("When calling insert with the correct methods", function() {
				it("The method should insert the records", function(done) {
					var entity = generateSampleData1();
					staffDataDao.insert(entity).then(function(result) {
						validateData(result);
						done();
					});
				});
			});

			describe("When calling insert with an existing record associated to the same party", function() {
				it("The method should return an error", function(done) {
					var entity = generateSampleData1();
					staffDataDao
						.insert(entity)
						.then(function(result) {
							var entity2 = generateSampleData1();
							return staffDataDao.insert(entity2);
						})
						.then(
							function() {
								expect.fail("The method should not have inserted the record");
							},
							function(err) {
								expect(err.length).eq(1);
								expect(err[0].attribute).eq(StaffDataEntityValidator.ID_CONTACT);
								expect(err[0].message).eq(StaffDataEntityValidator.ID_CONTACT_DUPLICATED);
								expect(err[0].value).eq(entity.idContact);
								done();
							}
						);
				});
			});
		});
	});
});
