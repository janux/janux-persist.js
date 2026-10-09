/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var DataSourceHandler = require("../../../dist/index").DataSourceHandler;

describe("Testing DataSourceHandler.getDataSource", function() {
	// getDataSource() only registers a DataSource; it does not connect, so no database is needed.
	var suffix = Date.now();

	describe("Given the same dbEngine and the same path", function() {
		it("returns the already registered DataSource", function() {
			var path = "mongodb://localhost/ds-handler-same-" + suffix;
			var first = DataSourceHandler.getDataSource(DataSourceHandler.MONGOOSE, path);
			var second = DataSourceHandler.getDataSource(DataSourceHandler.MONGOOSE, path);
			expect(second).eq(first);
		});
	});

	describe("Given the same dbEngine and a different path", function() {
		it("returns a distinct DataSource bound to the requested path (mongoose)", function() {
			var pathA = "mongodb://localhost/ds-handler-a-" + suffix;
			var pathB = "mongodb://localhost/ds-handler-b-" + suffix;
			var a = DataSourceHandler.getDataSource(DataSourceHandler.MONGOOSE, pathA);
			var b = DataSourceHandler.getDataSource(DataSourceHandler.MONGOOSE, pathB);
			expect(b).not.eq(a);
			expect(a.path).eq(pathA);
			expect(b.path).eq(pathB);
		});

		it("returns a distinct DataSource bound to the requested path (lokijs)", function() {
			var pathA = "ds-handler-a-" + suffix + ".db";
			var pathB = "ds-handler-b-" + suffix + ".db";
			var a = DataSourceHandler.getDataSource(DataSourceHandler.LOKIJS, pathA);
			var b = DataSourceHandler.getDataSource(DataSourceHandler.LOKIJS, pathB);
			expect(b).not.eq(a);
			expect(a.path).eq(pathA);
			expect(b.path).eq(pathB);
		});
	});

	describe("Given the same path under different dbEngines", function() {
		it("does not mix them up", function() {
			var path = "ds-handler-engines-" + suffix;
			var mongoose = DataSourceHandler.getDataSource(DataSourceHandler.MONGOOSE, path);
			var loki = DataSourceHandler.getDataSource(DataSourceHandler.LOKIJS, path);
			expect(loki).not.eq(mongoose);
			expect(mongoose.dbEngine).eq(DataSourceHandler.MONGOOSE);
			expect(loki.dbEngine).eq(DataSourceHandler.LOKIJS);
		});
	});
});
