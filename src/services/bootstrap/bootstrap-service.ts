/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
import * as Promise from "bluebird";
import * as logger from 'log4js';
import * as loki from 'lokijs';
import * as mongoose from "mongoose";
import {isBlank} from "../../util/blank-string-validator";
import {BootstrapLokiJsDaos} from "./bootatrap-lokijs";
import {BootStrapMongoDbDaos} from "./bootstrap-mongodb";
export class BootstrapService {

    public static readonly MONGODB: string = "mongodb";
    public static readonly LOKIJS: string = "lokijs";
    public static serviceStarted: boolean = false;

    /**
     * Starts the janux persistence modules.
     * @param dbEngine It can be "mongodb" or "lokijs"
     * @param dbParams If dbEngine is "mongodb" then dbParams must be the url where
     * the mongo database is located. If dbEngine is "lokijs" then the value must be the
     * path where the database is going to be located.
     */
    public static start(dbEngine: string, dbParams: string): Promise<any> {
        this._log.info("Call to start with dbEngine: %j dbParams: %j", dbEngine, dbParams);

        if (this.serviceStarted === true) {
            return Promise.resolve("Service already started");
        }
        if (isBlank(dbParams)) {
            return Promise.reject("dbParams is empty");
        }
        if (isBlank(dbEngine)) {
            return Promise.reject("dbEngine is empty");
        }

        if (dbEngine !== this.MONGODB || dbEngine !== this.LOKIJS) {
            return Promise.reject("dbEngine is not " + this.LOKIJS + " or " + this.MONGODB);
        } else {
            if (dbEngine === this.MONGODB) {
                return this.connectToMongodbDatabase(dbParams)
                    .then((mongoose) => {
                        BootStrapMongoDbDaos.initMongoDbDaos(mongoose);
                        this.serviceStarted = true;
                        return Promise.resolve();
                    });
            } else {
                return this.connectToLokiDatabase(dbParams)
                    .then((lokiDb) => {
                        BootstrapLokiJsDaos.initLokiJsDaos(lokiDb);
                        this.serviceStarted = true;
                        Promise.resolve();
                    });
            }
        }
    }

    private static _log = logger.getLogger("BootstrapService");

    private static connectToMongodbDatabase(mongoConnUrl: string): Promise<any> {
        this._log.info("Connecting to mongodb database");
        this._log.info("Connecting to %j", mongoConnUrl);

        return new Promise((resolve, reject) => {
            mongoose.connect(mongoConnUrl, (err) => {
                if (err) {
                    if (err.message === "Trying to open unclosed connection.") {
                        resolve();
                    } else {
                        this._log.fatal("Error connecting to mongodb database %j ", err);
                        reject(err);
                    }
                } else {
                    resolve(mongoose);
                }
            });
            mongoose.connection.on("disconnected", () => {
                this._log.warn("Mongoose default connection disconnected");
            });
        });
    }

    private static connectToLokiDatabase(lokiJsDBPath: string): Promise<any> {
        this._log.info("Connecting to lokijs database");
        const db = new loki(lokiJsDBPath);
        return Promise.resolve(db);
    }
}
