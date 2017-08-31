//
// This file can be used to setup any 'root-level hooks' that should run before or
// after the whole test suite, or before or after each test.
// See the section 'root-level hooks' under:
//
//     https://mochajs.org/#hooks
//
var config = require('config');
var log4js = require('log4js');

before(function () {
	// we need to configure log4js here, because configuring it in the gulp build will
	// not configure it for the mocha run
	log4js.configure(config.log4js);
});
