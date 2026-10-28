/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var redact = require("../../dist/utils/redact/redact-log-values");

describe("Testing redact-log-values (JAM-80)", function() {
	var SENSITIVE = ["code"];
	var R = redact.REDACTED;

	describe("loggableValue / loggableValues", function() {
		it("replaces the value of a sensitive attribute and leaves the others", function() {
			expect(redact.loggableValue("code", "abc", SENSITIVE)).eq(R);
			expect(redact.loggableValue("username", "abc", SENSITIVE)).eq("abc");
			expect(redact.loggableValues("code", ["a", "b"], SENSITIVE)).eq(R);
			expect(redact.loggableValues("id", ["a", "b"], SENSITIVE)).eql(["a", "b"]);
		});

		it("leaves everything alone when the DAO declares nothing sensitive", function() {
			expect(redact.loggableValue("code", "abc", undefined)).eq("abc");
			expect(redact.loggableValue("code", "abc", [])).eq("abc");
		});
	});

	describe("loggableFilters", function() {
		it("replaces only the value of a sensitive attribute's filter", function() {
			var filters = [{ attributeName: "code", value: "abc" }, { attributeName: "status", value: "pending" }];
			expect(redact.loggableFilters(filters, SENSITIVE)).eql([
				{ attributeName: "code", value: R },
				{ attributeName: "status", value: "pending" }
			]);
			// the filters passed in are not touched
			expect(filters[0].value).eq("abc");
		});
	});

	describe("loggableQuery", function() {
		it("redacts a sensitive attribute however the query writes it", function() {
			expect(redact.loggableQuery({ code: "abc" }, SENSITIVE)).eql({ code: R });
			expect(redact.loggableQuery({ code: { $eq: "abc" } }, SENSITIVE)).eql({ code: R });
		});

		it("redacts inside nested $and / $or lists and keeps the rest readable", function() {
			var query = { $and: [{ id: { $ne: "42" } }, { $or: [{ code: { $eq: "abc" } }, { status: "pending" }] }] };
			expect(redact.loggableQuery(query, SENSITIVE)).eql({
				$and: [{ id: { $ne: "42" } }, { $or: [{ code: R }, { status: "pending" }] }]
			});
			expect(query.$and[1].$or[0].code.$eq).eq("abc");
		});

		it("leaves non-plain values such as dates and regular expressions alone", function() {
			var when = new Date();
			var pattern = /x/;
			var result = redact.loggableQuery({ expire: { $lt: when }, name: pattern }, SENSITIVE);
			expect(result.expire.$lt).eq(when);
			expect(result.name).eq(pattern);
		});

		it("passes through anything that is not a query", function() {
			expect(redact.loggableQuery(undefined, SENSITIVE)).eq(undefined);
			expect(redact.loggableQuery("abc", SENSITIVE)).eq("abc");
			expect(redact.loggableQuery({ code: "abc" }, [])).eql({ code: "abc" });
		});
	});
});
