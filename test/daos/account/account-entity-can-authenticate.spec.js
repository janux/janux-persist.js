var chai = require("chai");
var expect = chai.expect;

var AccountEntity = require("../../../dist/index").AccountEntity;

function account(overrides) {
	return Object.assign(new AccountEntity(), { enabled: true, locked: false, expire: null }, overrides);
}

describe("Testing AccountEntity.canAuthenticate (JAM-24/JAM-46)", function() {
	it("returns true for an enabled, unlocked, unexpired account", function() {
		expect(account().canAuthenticate()).eq(true);
	});

	it("returns false when enabled is false", function() {
		expect(account({ enabled: false }).canAuthenticate()).eq(false);
	});

	it("returns false when enabled was never set (fails closed)", function() {
		var acct = account();
		delete acct.enabled;
		expect(acct.canAuthenticate()).eq(false);
	});

	it("returns false when locked is true", function() {
		expect(account({ locked: true }).canAuthenticate()).eq(false);
	});

	it("returns true when locked was never set (defaults open)", function() {
		var acct = account();
		delete acct.locked;
		expect(acct.canAuthenticate()).eq(true);
	});

	it("returns false when expire is in the past", function() {
		expect(account({ expire: new Date("2019-01-01") }).canAuthenticate()).eq(false);
	});

	it("returns true when expire is in the future", function() {
		expect(account({ expire: new Date("2099-01-01") }).canAuthenticate()).eq(true);
	});

	it("returns true when expire was never set (defaults open)", function() {
		var acct = account();
		delete acct.expire;
		expect(acct.canAuthenticate()).eq(true);
	});

	it("ignores expirePassword entirely (JAM-45 is separate)", function() {
		expect(account({ expirePassword: new Date("2019-01-01") }).canAuthenticate()).eq(true);
	});
});
