/**
 * Project janux-persistence
 * Created by ernesto on 7/19/17.
 */

import * as _ from 'lodash';
import * as logger from 'log4js';
import {PartyDaoLokiJsImpl} from "../../daos/party/lokijs/party-dao-loki-js-impl";
import {PartyDaoMongoDbImpl} from "../../daos/party/mongodb/party-dao-mongodb-impl";
import {PartyMongoDbSchema} from "../../daos/party/mongodb/party-mongodb-schema";
import {PartyDao} from "../../daos/party/party-dao";
import {AccountDao} from "../../daos/user/account-dao";
import {AccountDaoLokiJsImpl} from "../../daos/user/lokijs/account-dao-lokijs-impl";
import {AccountDaoMongodbImpl} from "../../daos/user/mongodb/account-dao-mongodb-impl";
import {AccountMongoDbSchema} from "../../daos/user/mongodb/account-mongodb-schema";
import {EntityProperties} from "../../persistence/implementations/dao/entity-properties";
import {LokiJsRepository} from "../../persistence/implementations/db-engines/lokijs-repository";
import {MongoDbRepository} from "../../persistence/implementations/db-engines/mongodb-repository";
import {DataSource} from "../datasource-handler/datasource";
import {DataSourceHandler} from "../datasource-handler/datasource-handler";
import {Dao} from "./dao";

/**
 * This class helps to generate the daos with only the database params.
 * Given the database params, this class hides which implementation classes are used.
 */
export class DaoFactory {

    /**
     * Get a new party dao, or a existing one with the same db engine and dbPath.
     * @param dbEngine
     * @param {string} dbPath
     * @return {PartyDao}
     */
    public static createPartyDao(dbEngine: any, dbPath: string): PartyDao {
        this._log.debug("Call to createPartyDao with dbEngine %j , dbPath %j", dbEngine, dbPath);
        let partyDao: PartyDao;
        const existingDao: Dao = this.getDao(dbEngine, dbPath, this.PARTY_DEFAULT_COLLECTION_NAME);
        if (_.isUndefined(existingDao)) {
            this._log.debug("Creating a new partyDao");
            const dataSource: DataSource = this.getDataSource(dbEngine, dbPath);
            if (dbEngine === DataSourceHandler.MONGODB) {
                partyDao = new PartyDaoMongoDbImpl(
                    new MongoDbRepository(dataSource.dbConnection.model(this.PARTY_DEFAULT_COLLECTION_NAME, PartyMongoDbSchema)),
                    new EntityProperties(false, true)
                );
            } else {
                partyDao = new PartyDaoLokiJsImpl(new LokiJsRepository(this.PARTY_DEFAULT_COLLECTION_NAME, dataSource.dbConnection),
                    new EntityProperties(false, true)
                );
            }
            this.insertDao(dbEngine, dbPath, this.PARTY_DEFAULT_COLLECTION_NAME, partyDao);
            return partyDao;
        } else {
            this._log.debug("Returning an existing partyDao");
            partyDao = existingDao.daoInstance;
            return partyDao;
        }
    }

    /**
     * Gets a new account dao, or a existing one with the same db engine and dbPath.
     * @param dbEngine
     * @param {string} dbPath
     * @return {AccountDao}
     */
    public static createAccountDao(dbEngine: any, dbPath: string): AccountDao {
        this._log.debug("Call to createAccountDao with dbEngine %j , dbPath %j", dbEngine, dbPath);
        const existingDao: Dao = this.getDao(dbEngine, dbPath, this.ACCOUNT_DEFAULT_COLLECTION_NAME);
        let accountDao: AccountDao;
        if (_.isUndefined(existingDao)) {
            this._log.debug("Creating a new createAccountDao");
            const dataSource: DataSource = this.getDataSource(dbEngine, dbPath);
            if (dbEngine === DataSourceHandler.MONGODB) {
                accountDao = new AccountDaoMongodbImpl(
                    new MongoDbRepository(dataSource.dbConnection.model(this.ACCOUNT_DEFAULT_COLLECTION_NAME, AccountMongoDbSchema)),
                    new EntityProperties(false, true));
            } else {
                accountDao = new AccountDaoLokiJsImpl(
                    new LokiJsRepository(this.ACCOUNT_DEFAULT_COLLECTION_NAME, dataSource.dbConnection),
                    new EntityProperties(false, true)
                );
            }
            this.insertDao(dbEngine, dbPath, this.ACCOUNT_DEFAULT_COLLECTION_NAME, accountDao);
            this._log.debug("Returning inserted promise");
            return accountDao;
        } else {
            this._log.debug("Returning an existing accountDao");
            accountDao = existingDao.daoInstance;
            return accountDao;
        }
    }

    private static PARTY_DEFAULT_COLLECTION_NAME: string = "contact";
    private static ACCOUNT_DEFAULT_COLLECTION_NAME: string = "account";
    private static _log = logger.getLogger("DaoFactoryService");
    private static daos: Dao[] = [];

    /**
     * Validates the input and, if the values are valid, returns a connection ready to be used.
     * @param dbEngine
     * @param {string} path
     * @return {Promise<DataSource>}
     */
    private static getDataSource(dbEngine: any, path: string): DataSource {
        this._log.debug("Call to getDataSource with dbEngine: %j path: %j", dbEngine, path);
        const dataSource: DataSource = DataSourceHandler.getDataSource(dbEngine, path, undefined);
        // Connect to the database.
        return dataSource.connect();
    }

    private static getDao(dbEngine: any, dbPath: string, daoName: string): Dao {
        const existingDaos: Dao[] = this.daos.filter((value) => value.dbEngine === dbEngine && value.daoName === daoName && value.dbPath === dbPath);
        let result: Dao;
        if (existingDaos.length === 1) {
            result = existingDaos[0];
        } else if (existingDaos.length === 0) {
            result = undefined;
        } else {
            throw  new Error("There is more than one dao with the same features");
        }
        return result;
    }

    private static insertDao(dbEngine: any, dbPath: string, daoName: string, partyDao: any) {
        const dao: Dao = new Dao();
        dao.daoInstance = partyDao;
        dao.daoName = daoName;
        dao.dbPath = dbPath;
        dao.dbEngine = dbEngine;
        this.daos.push(dao);
    }
}
