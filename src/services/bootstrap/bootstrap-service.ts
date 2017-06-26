/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
import * as Promise from "bluebird";
import * as logger from 'log4js';
import * as loki from 'lokijs';
import * as mongoose from "mongoose";
import {Persistence} from "../../daos/persistence";
import {isBlank} from "../../util/blank-string-validator";
import {BootstrapLokiJsDaos} from "./bootatrap-lokijs";
import {BootStrapMongoDbDaos} from "./bootstrap-mongodb";
export class BootstrapService {

    public static readonly MONGODB: string = "mongodb";
    public static readonly LOKIJS: string = "lokijs";
    public static readonly DB_PARAMS_EMPTY = "dbParams is empty";
    public static readonly DB_ENGINE_EMPTY = "dbEngine is empty";
    public static serviceStarted: boolean = false;
    public static DB_ENGINE_INVALID = "dbEngine is invalid";

    /**
     * Starts the janux persistence modules.
     * @param dbEngine It can be "mongodb" or "lokijs"
     * @param dbParams If dbEngine is "mongodb" then dbParams must be the url where
     * the mongo database is located. If dbEngine is "lokijs" then the value must be the
     * path where the database is going to be located.
     */
    public static start(dbEngine: string, dbParams: string): Promise<any> {
        this._log.info("Call to start with dbEngine: %j dbParams: %j", dbEngine, dbParams);

        if (isBlank(dbParams)) {
            return Promise.reject(this.DB_PARAMS_EMPTY);
        }
        if (isBlank(dbEngine)) {
            return Promise.reject(this.DB_ENGINE_EMPTY);
        }
        if (this.serviceStarted === true) {
            return Promise.resolve("Service already started");
        }

        if (dbEngine !== this.MONGODB && dbEngine !== this.LOKIJS) {
            return Promise.reject(this.DB_ENGINE_INVALID);
        } else {
            if (dbEngine === this.MONGODB) {
                return this.connectToMongodbDatabase(dbParams)
                    .then((mongoose) => {
                        BootStrapMongoDbDaos.initMongoDbDaos(mongoose);
                        this.mongoose = mongoose;
                        this.serviceStarted = true;
                        this.dbEngineUsed = this.MONGODB;
                        return Promise.resolve();
                    });
            } else {
                return this.connectToLokiDatabase(dbParams)
                    .then((lokiDb) => {
                        BootstrapLokiJsDaos.initLokiJsDaos(lokiDb);
                        this.lokiDb = lokiDb;
                        this.serviceStarted = true;
                        this.dbEngineUsed = this.LOKIJS;
                        Promise.resolve();
                    });
            }
        }
    }

    /**
     * Close the persistence module
     */
    public static stop(): Promise<any> {
        if (this.serviceStarted === true) {
            if (this.dbEngineUsed === this.MONGODB) {
                mongoose.disconnect();
                this.cleanPersistence();
                this.serviceStarted = false;
                return Promise.resolve();
            } else {
                this.lokiDb.close();
                this.serviceStarted = false;
                this.cleanPersistence();
                return Promise.resolve();
            }
        } else {
            this._log.debug("Service not started");
            return Promise.resolve();
        }
    }

    private static dbEngineUsed: string;
    private static mongoose: any;
    private static lokiDb: any;
    private static _log = logger.getLogger("BootstrapService");

    private static connectToMongodbDatabase(mongoConnUrl: string): Promise<any> {
        this._log.info("Connecting to mongodb database");
        this._log.info("Connecting to %j", mongoConnUrl);

        return new Promise((resolve, reject) => {
            mongoose.connect(mongoConnUrl, (err) => {
                if (err) {
                    if (err.message === "Trying to open unclosed connection.") {
                        resolve(mongoose);
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

    private static cleanPersistence() {
        Persistence.accountDao = undefined;
        Persistence.accountRoleDao = undefined;
        Persistence.displayNameDao = undefined;
        Persistence.authContextDao = undefined;
        Persistence.permissionBitDao = undefined;
        Persistence.roleDao = undefined;
        Persistence.rolePermissionBitDao = undefined;
        Persistence.countryDao = undefined;
        Persistence.stateProvinceDao = undefined;
        Persistence.partyDao = undefined;
        Persistence.cityDao = undefined;
    }
}
