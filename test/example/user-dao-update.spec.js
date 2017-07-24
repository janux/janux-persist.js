/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */

'use strict';
require('bluebird');
var config = require('config');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var lokijs = require('lokijs');
var mongoose = require('mongoose');
var ExampleUser = require("../../lib/index").ExampleUser;
var ExampleUserDaoLokiJsImpl = require("../../lib/index").ExampleUserDaoLokiJsImpl;
var ExampleUserDaoMongoDbImpl = require("../../lib/index").ExampleUserDaoMongoDbImpl;
var MongoUserSchemaExample = require("../../lib/index").MongoUserSchemaExample;
var LokiJsRepository = require("../../lib/index").LokiJsRepository;
var MongoDbRepository = require("../../lib/index").MongoDbRepository;
var EntityProperties = require("../../lib/index").EntityProperties;


//Config files
var serverAppContext = config.get("serverAppContext");

//lokiJs implementation
var lokiDatabase = new lokijs(serverAppContext.db.lokiJsDBPath);
var dbEngineUtilLokijs = new LokiJsRepository('users-example', lokiDatabase);
var userDaoLokiJS = ExampleUserDaoLokiJsImpl.createInstance(dbEngineUtilLokijs, new EntityProperties(true, true));

//Mongodb implementation
mongoose.connect(serverAppContext.db.mongoConnUrl);
var model = mongoose.model('users-example', MongoUserSchemaExample);
var dbEngineUtilMongodb = new MongoDbRepository(model);
var userDaoMongoDb = ExampleUserDaoMongoDbImpl.createInstance(dbEngineUtilMongodb, new EntityProperties(true, true));

const email = "jon@smith.com";
const email2 = "jane_smith@gmail.com";
const name = "John";
const lastName = "Smith";
const newName = "Lucas";
const newLastName = "Perez";
const newEmail = "newEmail@mail.com";
const invalidEmail = "email.com";

describe("Testing user example dao update methods", function () {
    [userDaoLokiJS,userDaoMongoDb].forEach(function (userDao) {
        var insertedUsers;

        beforeEach(function (done) {
            userDao.deleteAll()
                .then(function () {
                    var user = new ExampleUser(name, lastName, email);
                    var user2 = new ExampleUser(name, lastName, email2);
                    userDao.insertMany([user, user2]).then(function (result) {
                        insertedUsers = result;
                        done();
                    })
                });
        });

        context("Given the inserted users", function () {
            it("This method should update with no problems", function (done) {
                var user = insertedUsers[0];
                var id = user.id;
                user.name = newName;
                user.lastName = newLastName;
                user.email = newEmail;
                userDao.update(user)
                    .then(function (result) {
                        //Perform a query
                        expect(result.id).not.to.be.null;
                        expect(result.lastUpdate).to.be.a("Date");
                        expect(result.typeName).eq("an example of a getter");
                        userDao.findOneById(id)
                            .then(function (queryResult) {
                                expect(queryResult.id).eq(id);
                                expect(queryResult.name).eq(newName);
                                expect(queryResult.lastName).eq(newLastName);
                                expect(queryResult.typeName).eq("an example of a getter");
                                expect(queryResult.email).eq(newEmail);
                                expect(queryResult.typeName).not.to.be.undefined;
                                expect(queryResult).to.have.property("dateCreated");
                                expect(queryResult).to.have.property("uuid");
                                expect(queryResult).to.have.property('lastUpdate');
                                expect(queryResult.lastUpdate).to.be.a("Date");
                                done();
                            }, function (error) {
                                assert.fail(error, "The method shouldn't have returned a result");
                                done();
                            });
                    }, function (error) {
                        assert.fail(error, "The method shouldn't have returned an error");
                        done();
                    });
            });

            it("This method should send a reject due to an invalid email", function (done) {
                var user = insertedUsers[0];
                user.name = newName;
                user.lastName = newLastName;
                user.email = invalidEmail;
                userDao.update(user)
                    .then(function (result) {
                        assert.fail(result, "The method should have sent an error");
                        done();
                    }, function (error) {
                        expect(error.length).eq(1);
                        done();
                    });
            });

            it("This method should send a reject due to duplicated email", function (done) {
                var user = insertedUsers[0];
                user.email = email2;
                userDao.update(user)
                    .then(function (result) {
                        assert.fail(result, "The method should have sent an error");
                        done();
                    }, function (error) {
                        expect(error.length).eq(1);
                        done();
                    });
            });
        });
    });
});
