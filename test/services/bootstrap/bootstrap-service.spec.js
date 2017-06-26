/**
 * Project janux-persistence
 * Created by ernesto on 6/26/17.
 */

var chai = require('chai');
var expect = chai.expect;
var BootStrapService = require("../../../dist/index").BootstrapService;
var Persistence = require("../../../dist/index").Persistence;
//Config files
var config = require('config');
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;

describe("Testing bootstrap service", function () {

    beforeEach(function (done) {
        BootStrapService.stop()
            .then(function () {
                done();
            });
    });

    describe("When calling the service with empty db engine", function (done) {
        it("The method should return an error", function () {
            BootStrapService.start("  ", "aDatabase.db")
                .then(function () {
                    expect.fail("The method should have sent an error");
                    done();
                })
                .catch(function (err) {
                    expect(err).eq(BootStrapService.DB_ENGINE_EMPTY);
                });
        });
    });

    describe("When calling the service with empty db params", function (done) {
        it("The method should return an error", function () {
            BootStrapService.start(BootStrapService.MONGODB, "  ")
                .then(function () {
                    expect.fail("The method should have sent an error");
                    done();
                })
                .catch(function (err) {
                    expect(err).eq(BootStrapService.DB_PARAMS_EMPTY);
                });
        });
    });

    describe("When calling the service with invalid db engine", function (done) {
        it("The method should return an error", function () {
            BootStrapService.start("mysql", "aDb.db")
                .then(function () {
                    expect.fail("The method should have sent an error");
                    done();
                })
                .catch(function (err) {
                    expect(err).eq(BootStrapService.DB_ENGINE_INVALID);
                });
        });
    });

    describe("When calling start with correct mongodb params", function () {
        it("The method should have started with no problems", function (done) {
            BootStrapService.start(BootStrapService.MONGODB, mongoConnUrl)
                .then(function () {
                    expect(BootStrapService.serviceStarted).eq(true);
                    validatePersistenceNotUndefined();
                    done();
                })
                .catch(function (err) {
                    expect.fail("The method should have started with no problems");
                    done();
                });
        });
    });

    describe("When calling start with correct lokijs params", function () {
        it("The method should have started with no problems", function (done) {
            BootStrapService.start(BootStrapService.LOKIJS, lokiJsDBPath)
                .then(function () {
                    expect(BootStrapService.serviceStarted).eq(true);
                    validatePersistenceNotUndefined();
                    done();
                })
                .catch(function (err) {
                    expect.fail("The method should have started with no problems")
                });
        });
    });

    describe("When calling stop", function () {
        it("The method should have stopped with no problems", function (done) {
            BootStrapService.start(BootStrapService.LOKIJS, lokiJsDBPath)
                .then(function () {
                    return BootStrapService.stop();
                })
                .then(function () {
                    expect(BootStrapService.serviceStarted).eq(false);
                    validateUndefinedPersistence();
                    done();
                })
                .catch(function (err) {
                    expect.fail("The method should have started with no problems")
                });
        });
    });

    function validatePersistenceNotUndefined() {
        expect(Persistence.accountDao).not.to.be.undefined;
        expect(Persistence.accountRoleDao).not.to.be.undefined;
        expect(Persistence.displayNameDao).not.to.be.undefined;
        expect(Persistence.authContextDao).not.to.be.undefined;
        expect(Persistence.permissionBitDao).not.to.be.undefined;
        expect(Persistence.roleDao).not.to.be.undefined;
        expect(Persistence.rolePermissionBitDao).not.to.be.undefined;
        expect(Persistence.countryDao).not.to.be.undefined;
        expect(Persistence.stateProvinceDao).not.to.be.undefined;
        expect(Persistence.partyDao).not.to.be.undefined;
        expect(Persistence.cityDao).not.to.be.undefined;
    }

    function validateUndefinedPersistence() {
        expect(Persistence.accountDao).to.be.undefined;
        expect(Persistence.accountRoleDao).to.be.undefined;
        expect(Persistence.displayNameDao).to.be.undefined;
        expect(Persistence.authContextDao).to.be.undefined;
        expect(Persistence.permissionBitDao).to.be.undefined;
        expect(Persistence.roleDao).to.be.undefined;
        expect(Persistence.rolePermissionBitDao).to.be.undefined;
        expect(Persistence.countryDao).to.be.undefined;
        expect(Persistence.stateProvinceDao).to.be.undefined;
        expect(Persistence.partyDao).to.be.undefined;
        expect(Persistence.cityDao).to.be.undefined;
    }
});
