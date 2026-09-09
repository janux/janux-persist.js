var chai = require("chai");
var expect = chai.expect;

var canAccountAuthenticate = require("../../../dist/index").canAccountAuthenticate;

function account(overrides) {
	return Object.assign({ enabled: true, locked: false, expire: null }, overrides);
}

describe("Testing canAccountAuthenticate (JAM-24/JAM-46)", function() {
	it("returns true for an enabled, unlocked, unexpired account", function() {
		expect(canAccountAuthenticate(account())).eq(true);
	});

	it("returns false for a null account", function() {
		expect(canAccountAuthenticate(null)).eq(false);
	});

	it("returns false when enabled is false", function() {
		expect(canAccountAuthenticate(account({ enabled: false }))).eq(false);
	});

	it("returns false when enabled was never set (fails closed)", function() {
		var acct = account();
		delete acct.enabled;
		expect(canAccountAuthenticate(acct)).eq(false);
	});

	it("returns false when locked is true", function() {
		expect(canAccountAuthenticate(account({ locked: true }))).eq(false);
	});

	it("returns true when locked was never set (defaults open)", function() {
		var acct = account();
		delete acct.locked;
		expect(canAccountAuthenticate(acct)).eq(true);
	});

	it("returns false when expire is in the past", function() {
		expect(canAccountAuthenticate(account({ expire: new Date("2019-01-01") }))).eq(false);
	});

	it("returns true when expire is in the future", function() {
		expect(canAccountAuthenticate(account({ expire: new Date("2099-01-01") }))).eq(true);
	});

	it("returns true when expire was never set (defaults open)", function() {
		var acct = account();
		delete acct.expire;
		expect(canAccountAuthenticate(acct)).eq(true);
	});

	it("ignores expirePassword entirely (JAM-45 is separate)", function() {
		expect(canAccountAuthenticate(account({ expirePassword: new Date("2019-01-01") }))).eq(true);
	});
});
