/**
 * Project janux-persistence
 * Created by ernesto on 7/19/17.
 */

import * as _ from 'lodash';
import {AuthContextDao} from "../../daos/auth-context/auth-context-dao";
import {AuthContextDaoLokiJsImpl} from "../../daos/auth-context/lokijs/auth-context-dao-lokijs-impl";
import {AuthContextDaoMongooseImpl} from "../../daos/auth-context/mongoose/auth-context-dao-mongoose-impl";
import {AuthContextMongooseDbSchema} from "../../daos/auth-context/mongoose/auth-context-mongoose-schema";
import {PartyDaoLokiJsImpl} from "../../daos/party/lokijs/party-dao-loki-js-impl";
import {PartyDaoMongooseImpl} from "../../daos/party/mongoose/party-dao-mongoose-impl";
import {PartyMongooseSchema} from "../../daos/party/mongoose/party-mongoose-schema";
import {PartyDao} from "../../daos/party/party-dao";
import {AccountDao} from "../../daos/user/account-dao";
import {AccountDaoLokiJsImpl} from "../../daos/user/lokijs/account-dao-lokijs-impl";
import {AccountDaoMongooseImpl} from "../../daos/user/mongoose/account-dao-mongoose-impl";
import {AccountMongooseDbSchema} from "../../daos/user/mongoose/account-mongoose-schema";
import {EntityPropertiesImpl} from "../../persistence/implementations/dao/entity-properties";
import {LokiJsAdapter} from "../../persistence/implementations/db-adapters/lokijs-db-adapter";
import {MongooseAdapter} from "../../persistence/implementations/db-adapters/mongoose-db-adapter";
import * as logger from "../../util/logger-api/logger-api";
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
			if (dbEngine === DataSourceHandler.MONGOOSE) {
				partyDao = new PartyDaoMongooseImpl(
					new MongooseAdapter(dataSource.dbConnection.model(this.PARTY_DEFAULT_COLLECTION_NAME, PartyMongooseSchema)),
					new EntityPropertiesImpl(true, true)
				);
			} else {
				partyDao = new PartyDaoLokiJsImpl(new LokiJsAdapter(this.PARTY_DEFAULT_COLLECTION_NAME, dataSource.dbConnection),
					new EntityPropertiesImpl(true, true)
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
			if (dbEngine === DataSourceHandler.MONGOOSE) {
				accountDao = new AccountDaoMongooseImpl(
					new MongooseAdapter(dataSource.dbConnection.model(this.ACCOUNT_DEFAULT_COLLECTION_NAME, AccountMongooseDbSchema)),
					new EntityPropertiesImpl(true, true));
			} else {
				accountDao = new AccountDaoLokiJsImpl(
					new LokiJsAdapter(this.ACCOUNT_DEFAULT_COLLECTION_NAME, dataSource.dbConnection),
					new EntityPropertiesImpl(true, true)
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

	/**
	 * Gets a new AuthContext dao, or a existing one with the same db engine and dbPath.
	 * @param dbEngine
	 * @param {string} dbPath
	 * @return {AuthContextDao}
	 */
	public static createAuthContextDao(dbEngine: any, dbPath: string): AuthContextDao {
		this._log.debug("Call to createAuthContextDao with dbEngine %j , dbPath %j", dbEngine, dbPath);
		const existingDao: Dao = this.getDao(dbEngine, dbPath, this.AUTHCONTEXT_DEFAULT_COLLECTION_NAME);
		let authContextDao: AuthContextDao;
		if (_.isUndefined(existingDao)) {
			this._log.debug("Creating a new createAuthContextDao");
			const dataSource: DataSource = this.getDataSource(dbEngine, dbPath);
			if (dbEngine === DataSourceHandler.MONGOOSE) {
				authContextDao = new AuthContextDaoMongooseImpl(
					new MongooseAdapter(dataSource.dbConnection.model(this.AUTHCONTEXT_DEFAULT_COLLECTION_NAME, AuthContextMongooseDbSchema)),
					new EntityPropertiesImpl(true, true));
			} else {
				authContextDao = new AuthContextDaoLokiJsImpl(
					new LokiJsAdapter(this.AUTHCONTEXT_DEFAULT_COLLECTION_NAME, dataSource.dbConnection),
					new EntityPropertiesImpl(true, true)
				);
			}
			this.insertDao(dbEngine, dbPath, this.AUTHCONTEXT_DEFAULT_COLLECTION_NAME, authContextDao);
			this._log.debug("Returning inserted promise");
			return authContextDao;
		} else {
			this._log.debug("Returning an existing AuthContextDao");
			authContextDao = existingDao.daoInstance;
			return authContextDao;
		}
	}

	private static PARTY_DEFAULT_COLLECTION_NAME: string = "contact";
	private static ACCOUNT_DEFAULT_COLLECTION_NAME: string = "account";
	private static AUTHCONTEXT_DEFAULT_COLLECTION_NAME: string = "authcontext";
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
