/**
 * Project janux-persistence
 * Created by ernesto on 7/10/17.
 */


var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('config');
//Config files
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var BootstrapService = require("../../../dist/index").BootstrapService;
var dbParams = dbEngine === BootstrapService.LOKIJS ? lokiJsDBPath : mongoConnUrl;
var UserGenerator = require("../../../dist/index").UserGenerator;

describe("Testing users generator", function () {
    beforeEach(function (done) {
        BootstrapService.start(dbEngine, dbParams)
            .then(function () {
                done();
            })
    });


    describe("When calling the function.", function () {
        it("The method should have inserted the records", function (done) {
            UserGenerator.generateUserDateInTheDatabase()
                .then(function (result) {
                    expect(result.length > 0);
                    done();
                });
        })
    })
});
