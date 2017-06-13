/**
 * Project janux-persistence
 * Created by ernesto on 5/26/17.
 */
'use strict';
require('bluebird');
var config = require('config');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var lokijs = require('lokijs');
var mongoose = require('mongoose');
var ExampleUser = require("../../dist/index").ExampleUser;
var ExampleUserDaoLokiJsImpl = require("../../dist/index").ExampleUserDaoLokiJsImpl;
var ExampleUserDaoMongoDbImpl = require("../../dist/index").ExampleUserDaoMongoDbImpl;
var MongoUserSchemaExample = require("../../dist/index").MongoUserSchemaExample;
var DbEngineUtilLokijs = require("../../dist/index").DbEngineUtilLokijs;
var DbEngineUtilMongodb = require("../../dist/index").DbEngineUtilMongodb;
var EntityProperties = require("../../dist/index").EntityProperties;

//Config files
var serverAppContext = config.get("serverAppContext");

//lokiJs implementation
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new DbEngineUtilLokijs('usersExample', lokiDatabase);
var userDaoLokiJS = ExampleUserDaoLokiJsImpl.createInstance(
    dbEngineUtilLokijs,
    new EntityProperties(true, true)
);

//Mongodb implementation
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('users-example', MongoUserSchemaExample);
var dbEngineUtilMongodb = new DbEngineUtilMongodb(model);
var userDaoMongoDb = ExampleUserDaoMongoDbImpl.createInstance(
    dbEngineUtilMongodb,
    new EntityProperties(true, true));

const name = "John";
const email = "jon@smith.com";
const lastName = "Smith";
const name2 = "Jane";
const email2 = "jane@smith.com";
const lastName2 = "Smith";

const incorrectEmail = "johnSmith.com";

[userDaoLokiJS, userDaoMongoDb].forEach(function (userDao) {

    describe("Testing user example dao implementation insert", function () {
        beforeEach(function (done) {
            userDao.deleteAll().then(function () {
                done();
            });
        });

        describe("When inserting an incorrect user", function () {
            it("Should send an error", function (done) {
                var user = new ExampleUser(name, lastName, incorrectEmail);
                userDao.insert(user)
                    .then(function (result) {
                        assert.fail(result, "The system must no have inserted the user");
                        done();
                    }, function (error) {
                        assert("The program sent an error, is OK");
                        expect(error.length).eq(1);
                        done();
                    })
            });
        });

        describe("When inserting correctly", function () {
            it("Should the object have been inserted with the correct values", function (done) {
                var user = new ExampleUser(name, lastName, email);
                userDao.insert(user)
                    .then(function (result) {
                        if (user instanceof ExampleUser) {
                            expect(result.name).eq(name);
                            expect(result.email).eq(email);
                            expect(result.lastName).eq(lastName);
                            expect(result).to.have.property('id');
                            expect(result).to.have.property('uuid');
                            expect(result).to.have.property('dateCreated');
                            expect(result.dateUpdated).to.be.undefined;
                            expect(result.dateCreated).to.be.a("Date");

                            userDao.findOneById(result.id)
                                .then(function (resultQuery) {
                                    expect(resultQuery.name).eq(name);
                                    expect(resultQuery.email).eq(email);
                                    expect(resultQuery.lastName).eq(lastName);
                                    expect(resultQuery.id).eq(result.id);
                                    expect(result).to.have.property('uuid');
                                    expect(result).to.have.property('dateCreated');
                                    expect(result.dateCreated).to.be.a("Date");
                                    expect(result.dateUpdated).to.be.undefined;
                                    done();
                                })
                                .catch(function (err) {
                                    assert.fail(err, "The query must not have any error");
                                    done();
                                });                        } else {
                            assert.fail(true, "Object doesn't have the correct instance");
                            done();
                        }
                    }, function (error) {
                        assert.fail(error, "The system must have inserted the object successfully");
                        done();
                    })
            });
        });

        describe("When inserting many", function () {
            it("Should the records have been inserted correctly in the database", function (done) {
                var user = new ExampleUser(name, lastName, email);
                var user2 = new ExampleUser(name2, lastName2, email2);
                userDao.insertMany([user,user2])
                    .then(function (result) {
                        expect(result.length).eq(2);
                        for (var i = 0; i < result.length; i++) {
                            var obj = result[i];
                            expect(obj).to.have.property("id");
                            expect(obj).to.have.property("dateCreated");
                            expect(obj).to.have.property("uuid");
                        }
                        done();
                    })
                    .catch(function (err) {
                        assert.fail(error, "The method should have inserted the users");
                        done();
                    })
            })
        });


        describe("When inserting duplicated data", function () {
            it("Should the method send a reject", function (done) {
                var user = new ExampleUser(name, lastName, email);
                userDao.insert(user)
                    .then(function (result) {
                        var duplicatedUser = new ExampleUser(name, lastName, email);
                        userDao.insert(duplicatedUser)
                            .then(function (result) {
                                assert.fail(result, "The user must not be inserted");
                                done();
                            }, function (error) {
                                assert("The program sent an error, is OK");
                                done();
                            })
                    }, function (error) {
                        assert.fail(error, "Must be an inserted user");
                        done();
                    });
            })
        });


    });
});
