/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var redactConnectionUrl = require("../../dist/utils/redact/redact-connection-url").redactConnectionUrl;

describe("Testing redactConnectionUrl (JAM-152)", function() {
	describe("Given a connection string with credentials", function() {
		it("removes the user and password", function() {
			expect(redactConnectionUrl("mongodb://scanuser:s3cret@localhost/some-db")).eq("mongodb://localhost/some-db");
		});

		it("keeps the query string, which says how the credentials are checked", function() {
			expect(redactConnectionUrl("mongodb://scanuser:s3cret@localhost/some-db?authSource=admin")).eq(
				"mongodb://localhost/some-db?authSource=admin"
			);
		});

		it("keeps every host of a replica set", function() {
			expect(redactConnectionUrl("mongodb://scanuser:s3cret@db-01.example.com,db-02.example.com:27018/some-db")).eq(
				"mongodb://db-01.example.com,db-02.example.com:27018/some-db"
			);
		});

		it("handles other schemes", function() {
			expect(redactConnectionUrl("mongodb+srv://scanuser:s3cret@cluster0.example.net/some-db")).eq(
				"mongodb+srv://cluster0.example.net/some-db"
			);
		});

		it("leaves nothing of a password that contains an unescaped @ or /", function() {
			expect(redactConnectionUrl("mongodb://scanuser:p@ss/word@localhost/some-db")).eq("mongodb://localhost/some-db");
		});

		it("removes a user given without a password", function() {
			expect(redactConnectionUrl("mongodb://scanuser@localhost/some-db")).eq("mongodb://localhost/some-db");
		});
	});

	describe("Given a value that carries no credentials", function() {
		it("returns a URL without credentials unchanged", function() {
			expect(redactConnectionUrl("mongodb://localhost/some-db")).eq("mongodb://localhost/some-db");
		});

		it("returns a LokiJS file path unchanged, even one containing an @", function() {
			expect(redactConnectionUrl("./data/some.db")).eq("./data/some.db");
			expect(redactConnectionUrl("/var/data/some@host.db")).eq("/var/data/some@host.db");
		});

		it("returns anything that is not a string as it is", function() {
			var object = { path: "mongodb://scanuser:s3cret@localhost/some-db" };
			expect(redactConnectionUrl(undefined)).eq(undefined);
			expect(redactConnectionUrl(null)).eq(null);
			expect(redactConnectionUrl(42)).eq(42);
			expect(redactConnectionUrl(object)).eq(object);
		});
	});

	describe("Given text that quotes a connection string", function() {
		it("removes the credentials wherever the URL appears", function() {
			var text = "failed to connect to mongodb://scanuser:s3cret@localhost:27017/some-db: ECONNREFUSED, retry mongodb://other:pw2@db-02/x";
			var redacted = redactConnectionUrl(text);
			expect(redacted).eq(
				"failed to connect to mongodb://localhost:27017/some-db: ECONNREFUSED, retry mongodb://db-02/x"
			);
			expect(redacted).not.contain("s3cret");
			expect(redacted).not.contain("pw2");
		});

		it("does not touch an email address in the text", function() {
			expect(redactConnectionUrl("sent to someone@example.com")).eq("sent to someone@example.com");
		});
	});
});
