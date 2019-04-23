/**
 * Project janux-persistence
 * Created by ernesto on 7/19/17.
 */

import config = require("config");
import * as _ from "lodash";
import * as lokijs from "lokijs";
import * as mongoose from "mongoose";
import * as logger from "utils/logger-api/logger-api";
import {DataSourceHandler} from "./datasource-handler";
import {DataSourceStatus} from "./datasource-status";

/**
 * Provides connection info to the database
 */
export class DataSource {
	// Could be mongo db or lokijs
	public dbEngine: string;
	// Path to the connection, for lokijs is a file path, for mongoose is a url.
	public path: string;
	public extraParams: any;
	public status: DataSourceStatus;
	// For mongodb this is a mongoose is a connection instance, for lokijs is the db itself.
	public dbConnection: any;
	private log = logger.getLogger("DataSource");

	public connect(): DataSource {
		this.log.debug(
			"Call to connect with dbEngine: %j path:%j extraParams %j",
			this.dbEngine,
			this.path,
			this.extraParams
		);
		if (this.status === DataSourceStatus.CONNECTED) {
			this.log.debug("Datasource is connected");
			return this;
		} else {
			if (this.dbEngine === DataSourceHandler.MONGOOSE) {
				// mongoose
				return this.connectToMongodb();
			} else {
				// lokijs
				return this.connectToLokiJs();
			}
		}
	}

	private connectToMongodb(): DataSource {
		this.log.debug("Call to connectToMongodb with url", this.path);
		let conn: mongoose.Connection;
		if (_.isNil(this.dbConnection)) {
			// For the moment we are going to use poolSize from config.
			// Later, the pool size, if defined in the datasource, might override
			// the default value.
			const serverAppContext: any = config.get("serverAppContext");
			let poolSize: any = Number(serverAppContext.db.poolSize);
			poolSize = _.isNumber(poolSize) && poolSize > 5 ? poolSize : 5;
			this.log.info("Pool size to use: %j", poolSize);
			conn = mongoose.createConnection(this.path,
				{
					server: {
						poolSize
					}
				});
			this.dbConnection = conn;
			conn.on("error", err => {
				this.log.error("Error connecting to mongodb \n %j", this.path, err);
				this.dbConnection = null;
				throw new Error("Error connecting to mongodb database");
			});
			conn.once("open", () => {
				this.log.info("Connection to mongodb database successful", this.path);
				this.status = DataSourceStatus.CONNECTED;
			});
		}
		return this;
	}

	private connectToLokiJs(): DataSource {
		this.log.debug("Call to connectToLokiJs", this.path);
		this.dbConnection = new lokijs(this.path, {
			throttledSaves: false,
			autoload: true
		});
		this.status = DataSourceStatus.CONNECTED;
		// db.loadDatabase({}, (err, data) => {
		//    this.log.info("Connection to the database lokijs %j successful", this.path);
		// });
		return this;
	}
}
