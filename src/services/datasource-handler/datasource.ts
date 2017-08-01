/**
 * Project janux-persistence
 * Created by ernesto on 7/19/17.
 */

import * as log4js from "log4js";
import * as lokijs from "lokijs";
import * as mongoose from "mongoose";
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
    private log = log4js.getLogger("DataSource");

    public connect(): DataSource {
        this.log.debug("Call to connect with dbEngine: %j path:%j extraParams %j", this.dbEngine, this.path, this.extraParams);
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
        this.log.debug("Call to connectToMongodb with url %j", this.path);
        const conn: mongoose.Connection = mongoose.createConnection(this.path);
        this.dbConnection = conn;
        conn.on("error", (err) => {
            this.log.error("Error connecting to mongodb %j \n %j", this.path, err);
            throw  new Error("Error connecting to mongodb database");
        });
        conn.once("open", () => {
            this.log.info("Connection to mongodb database %j successful", this.path);
            this.status = DataSourceStatus.CONNECTED;
        });
        return this;
    }

    private connectToLokiJs(): DataSource {
        this.log.debug("Call to connectToLokiJs", this.path);
        const db = new lokijs(this.path, {throttledSaves: false, autoload: true});
        this.dbConnection = db;
        this.status = DataSourceStatus.CONNECTED;
        // db.loadDatabase({}, (err, data) => {
        //    this.log.info("Connection to the database lokijs %j successful", this.path);
        // });
        return this;
    }
}
