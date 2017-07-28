/**
 * Project janux-persistence
 * Created by ernesto on 7/19/17.
 */

import * as lokijs from "lokijs";
import {MongoDbUtil} from "../../persistence/util/mongodb-util.js";
import {LoggerFactory} from "../../util/logger-factory/logger_factory";
import {DataSourceHandler} from "./datasource-handler";
import {DataSourceStatus} from "./datasource-status";

/**
 * Provides connection info to the database
 */
export class DataSource {

    // Could be mongo db or lokijs
    public dbEngine: string;
    // Path to the connection, for lokijs is a file path, for mongodb is a url.
    public path: string;
    public extraParams: any;
    public status: DataSourceStatus;
    // For mongodb this is a mongoose is a connection instance, for lokijs is the db itself.
    public dbConnection: any;
    private log = LoggerFactory.getLogger("DataSource");

    public connect(): DataSource {
        this.log.debug("Call to connect with dbEngine: %j path:%j extraParams %j", this.dbEngine, this.path, this.extraParams);
        if (this.status === DataSourceStatus.CONNECTED) {
            this.log.debug("Datasource is connected");
            return this;
        } else {
            if (this.dbEngine === DataSourceHandler.MONGODB) {
                // mongodb
                return this.connectToMongodb();
            } else {
                // lokijs
                return this.connectToLokiJs();
            }
        }
    }

    /**
     * Connect to a mongo database.
     * @return {DataSource}
     */
    private connectToMongodb(): DataSource {
        this.log.debug("Call to connectToMongodb with url %j", this.path);
        // We are doing the connection inside the mongo db util for to isolate
        // the mongoose library.
        MongoDbUtil.connectToMongodb(this);
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
