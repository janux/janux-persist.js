//
// This file can be used to setup any 'root-level hooks' that should run before or
// after the whole test suite, or before or after each test.
// See the section 'root-level hooks' under:
//
//     https://mochajs.org/#hooks
//
var config = require("config");
var log4js = require("log4js");
// var mongoose = require("mongoose");
// var bluebird = require("bluebird");

before(function() {
	// we need to configure log4js here so that it is set up for the mocha run
	// config 3.x hands out immutable objects, and log4js's file appender sets
	// options on the object it is given, so pass it a copy
	log4js.configure(config.util.cloneDeep(config.log4js));
	// mongoose.Promise = bluebird;
});
