/**
 * Project janux-persistence
 */
var chai = require("chai");
var expect = chai.expect;
var EventEmitter = require("events").EventEmitter;
var capture = require("../../util/log-capture");
var mongoose = require("mongoose");
var index = require("../../../dist/index");
var DataSourceHandler = index.DataSourceHandler;
var DaoFactory = index.DaoFactory;
var CommService = index.CommService;
var loggerApi = require("../../../dist/utils/logger-api/logger-api");

//
// JAM-152: a connection string carries the database credentials, and no log statement may print
// one, at any level. Instead of checking each statement, this exercises every code path that
// mentions a data source path with a credentialed URL and looks at everything that was logged.
//
// Logging is intercepted on log4js's Logger itself, below the level check, so a DEBUG or TRACE
// statement is caught even though the suite runs at a higher level. Nothing is connected: the
// mongoose connection is a stand-in whose events the test fires.
//
describe("Testing that no log statement prints data source credentials (JAM-152)", function() {
	var PASSWORD = "s3cretPassw0rd";
	var suffix = Date.now();
	var originalCreateConnection;
	var connections;

	function urlFor(name) {
		return "mongodb://scanuser:" + PASSWORD + "@db-01.example.com,db-02.example.com/" + name + "-" + suffix + "?authSource=admin";
	}

	function FakeDao(adapter, entityProperties) {
		this.adapter = adapter;
		this.entityProperties = entityProperties;
	}

	before(function() {
		capture.install();
		originalCreateConnection = mongoose.createConnection;
		mongoose.createConnection = function(url) {
			var connection = new EventEmitter();
			connection.url = url;
			connection.model = function(name) {
				return { modelName: name };
			};
			connections.push(connection);
			return connection;
		};
	});

	after(function() {
		capture.uninstall();
		mongoose.createConnection = originalCreateConnection;
	});

	beforeEach(function() {
		capture.reset();
		connections = [];
	});

	function expectNoCredentials() {
		var leaks = capture.leaks([PASSWORD, "scanuser"]);
		expect(leaks, "log lines carrying credentials: " + JSON.stringify(leaks)).to.be.empty;
	}

	function logged(category, level) {
		return capture.entries().filter(function(entry) {
			return entry.category.indexOf(category) !== -1 && entry.level === level;
		});
	}

	it("registering a data source, new and already known", function() {
		var url = urlFor("handler");
		DataSourceHandler.getDataSource(DataSourceHandler.MONGOOSE, url);
		DataSourceHandler.getDataSource(DataSourceHandler.MONGOOSE, url);
		expect(logged("DataSourceHandler", "debug")).to.have.length(4); // two lookups, one new, one existing
		expectNoCredentials();
	});

	it("connecting, and being connected already", function() {
		var dataSource = DataSourceHandler.getDataSource(DataSourceHandler.MONGOOSE, urlFor("connect"));
		dataSource.connect();
		connections[0].emit("open");
		dataSource.connect();
		expect(logged("DataSource", "info")).to.have.length(1);
		expect(logged("DataSource", "info")[0].text).contain("db-01.example.com,db-02.example.com");
		expectNoCredentials();
	});

	it("failing to connect, including an error message that quotes the URL", function() {
		var url = urlFor("fails");
		var dataSource = DataSourceHandler.getDataSource(DataSourceHandler.MONGOOSE, url);
		dataSource.connect();
		expect(function() {
			connections[0].emit("error", new Error("failed to connect to " + url));
		}).to.throw("Error connecting to mongodb database");
		expect(logged("DataSource", "error")).to.have.length(1);
		expectNoCredentials();
	});

	it("connecting to a LokiJS file keeps logging the path", function() {
		var path = "no-credentials-in-logs-" + suffix + ".db";
		DataSourceHandler.getDataSource(DataSourceHandler.LOKIJS, path).connect();
		expect(capture.entries().some(function(entry) {
			return entry.text.indexOf(path) !== -1;
		})).eq(true);
	});

	it("subscribing a dao, new and reused", function() {
		var settings = {
			dbEngine: "mongoose",
			dbPath: urlFor("subscribe"),
			collectionName: "thing",
			schema: {},
			entityProperties: {}
		};
		var first = DaoFactory.subscribeDao(settings, FakeDao);
		var second = DaoFactory.subscribeDao(settings, FakeDao);
		expect(second).eq(first);
		expect(logged("DaoFactoryService", "debug").length).to.be.greaterThan(4);
		expectNoCredentials();
	});

	it("finding more than one dao for the same data source", function() {
		var dbPath = urlFor("duplicate");
		DaoFactory.subscribeDao({ dbEngine: "mongoose", dbPath: dbPath, collectionName: "twin", schema: {}, entityProperties: {} }, FakeDao);
		var twin = DaoFactory.daos.filter(function(dao) {
			return dao.dbPath === dbPath;
		})[0];
		DaoFactory.daos.push(twin);
		try {
			expect(function() {
				DaoFactory.subscribeDao({ dbEngine: "mongoose", dbPath: dbPath, collectionName: "twin", schema: {}, entityProperties: {} }, FakeDao);
			}).to.throw("more than one dao");
			expect(logged("DaoFactoryService", "error")).to.have.length(1);
			expectNoCredentials();
		} finally {
			DaoFactory.daos.pop();
		}
	});

	it("the mail service looking up its data source", function() {
		CommService.prototype.getDataSource.call(
			{ _log: loggerApi.getLogger("CommService") },
			"mongoose",
			urlFor("comm")
		);
		expect(logged("CommService", "debug")).to.have.length(1);
		expectNoCredentials();
	});
});
