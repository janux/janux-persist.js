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

var PersonEntity = require("janux-people.js").Person;
var OrganizationEntity = require("janux-people.js").Organization;
var PartyDaoLokiJsImpl = require("../../../dist/index").PartyDaoLokiJsImpl;
var PartyDaoMongoDbImpl = require("../../../dist/index").PartyDaoMongoDbImpl;
var DbEngineUtilLokijs = require("../../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../../dist/index").DbEngineUtilMongodb;
var PartyMongoDbSchema = require("../../../dist/index").PartyMongoDbSchema;

//Config files
var serverAppContext = config.get("serverAppContext");

// Loki js configuration
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath, {throttledSaves: true});
var dbEngineUtilLokijs = new DbEngineUtilLokijs('party-test', lokiDatabase);
var partyDaoLokijs = new PartyDaoLokiJsImpl(dbEngineUtilLokijs, null);

// Mongo db configuration
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('party-test', PartyMongoDbSchema);
var dbEngineMongoDb = new DbEngineUtilMongodb(model);
var partyDaoMongodb = new PartyDaoMongoDbImpl(dbEngineMongoDb, null);

const idAccount = "313030303030303030303037";
const idAccount2 = "313030303030303030303038";
const firstName = "John";
const middleName = "Doe";
const lastName = "Iglesias";
const displayName = "displayName";
const honorificPrefix = "honorificPrefix";
const honorificSuffix = "honorificSuffix";
const email = "glarus@mail.com";
const email2 = "glarus_sales@mail.com";
const email3 = "glarus_dev@mail.com";
const email4 = "glarus_sys@mail.com";
const email5 = "glarus_admin@mail.com";
const work = "work";
const home = "home";

const organizationName = "Glarus";
const organizationName2 = "Glarus 2";

const name2 = "Jane";
const middleName2 = "Smith";

describe("Testing party dao delete methods", function () {
    [partyDaoLokijs, partyDaoMongodb].forEach(function (partyDao) {
        describe("Given the inserted records", function () {

            var insertedRecordOrganization;
            var insertedRecordPerson;
            var insertedRecordOrganization2;
            var insertedRecordPerson2;

            beforeEach(function (done) {
                partyDao.deleteAll()
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
                    partyDao.deleteAll()
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
