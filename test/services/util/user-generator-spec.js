/**
 * Project janux-persistence
 * Created by ernesto on 7/10/17.
 */


var chai = require('chai');
var expect = chai.expect;
var config = require('config');
var UserGenerator = require("../../../dist/index").UserGenerator;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;
//Config files
var serverAppContext = config.get("serverAppContext");
var lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
var mongoConnUrl = serverAppContext.db.mongoConnUrl;
var dbEngine = serverAppContext.db.dbEngine;
var path = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

describe("Testing users generator", function () {


    describe("When calling the function.", function () {
        it("The method should have inserted the records", function (done) {
            UserGenerator.generateUserDateInTheDatabase(dbEngine, path)
                .then(function (result) {
                    expect(result.length > 0);
                    done();
                });
        })
    })
});
