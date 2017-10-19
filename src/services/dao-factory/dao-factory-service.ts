/**
 * Project janux-persistence
 * Created by ernesto on 7/19/17.
 */

import {AuthContextDao} from "daos/auth-context/auth-context-dao";
import {AuthContextDaoLokiJsImpl} from "daos/auth-context/lokijs/auth-context-dao-lokijs-impl";
import {AuthContextDaoMongooseImpl} from "daos/auth-context/mongoose/auth-context-dao-mongoose-impl";
import {AuthContextMongooseDbSchema} from "daos/auth-context/mongoose/auth-context-mongoose-schema";
import {GroupAttributeValueDao} from "daos/group-attribute-value/group-attribute-value-dao";
import {GroupAttributeValueMongooseSchema} from "daos/group-attribute-value/mongoose/group-attribute-value-schema";
import {GroupContentDao} from "daos/group-content/group-content-dao";
import {GroupContentMongooseSchema} from "daos/group-content/mongoose/group-value-mongoose-schema";
import {GroupDao} from "daos/group/group-dao";
import {GroupMongooseSchema} from "daos/group/mongoose/group-mongoose-schema";
import {PartyDaoLokiJsImpl} from "daos/party/lokijs/party-dao-loki-js-impl";
import {PartyDaoMongooseImpl} from "daos/party/mongoose/party-dao-mongoose-impl";
import {PartyMongooseSchema} from "daos/party/mongoose/party-mongoose-schema";
import {PartyDao} from "daos/party/party-dao";
import {RoleDaoLokiJsImpl} from "daos/role/lokijs/role-dao-lokijs-impl";
import {RoleDaoMongooseImpl} from "daos/role/mongoose/role-dao-mongoose-impl";
import {RoleMongooseDbSchema} from "daos/role/mongoose/role-mongoose-schema";
import {RoleDao} from "daos/role/role-dao";
import {AccountDao} from "daos/user/account-dao";
import {AccountDaoLokiJsImpl} from "daos/user/lokijs/account-dao-lokijs-impl";
import {AccountDaoMongooseImpl} from "daos/user/mongoose/account-dao-mongoose-impl";
import {AccountMongooseDbSchema} from "daos/user/mongoose/account-mongoose-schema";
import {DbAdapter} from "persistence/api/db-adapters/db-adapter";
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {LokiJsAdapter} from "persistence/implementations/db-adapters/lokijs-db-adapter";
import {MongooseAdapter} from "persistence/implementations/db-adapters/mongoose-db-adapter";
import {DaoSettings} from "services/dao-factory/dao-settings";
import {DataSource} from "services/datasource-handler/datasource";
import {DataSourceHandler} from "services/datasource-handler/datasource-handler";
import * as logger from 'util/logger-api/logger-api';
import {Dao} from "./dao";

/**
 * This class helps to generate the daos with only the database params.
 * Given the database params, this class hides which implementation classes are used.
 */
export class DaoFactory {

	public static subscribeDao<T>(daoSettings: DaoSettings,
								  classReference: any): T {
		this._log.debug("Call to subscribeDao with daoSettings %j", daoSettings);
		let dbAdapter: DbAdapter;
		let dao: T;
		const existingDao: Dao = this.getDao(daoSettings.dbEngine, daoSettings.dbPath, daoSettings.collectionName);
		if (existingDao == null) {
			const dataSource: DataSource = this.getDataSource(daoSettings.dbEngine, daoSettings.dbPath);
			dbAdapter = this.createDbAdapter(dataSource, daoSettings);
			dao = new classReference(dbAdapter, daoSettings.entityProperties);
			this.insertDao(daoSettings.dbEngine, daoSettings.dbPath, daoSettings.collectionName, dao);
		} else {
			dao = existingDao.daoInstance;
		}
		return dao;
	}

	/**
	 * Get a new party dao, or a existing one with the same db engine and dbPath.
	 * @param dbEngine
	 * @param {string} dbPath
	 * @return {PartyDao}
	 */
	public static createPartyDao(dbEngine: any, dbPath: string): PartyDao {
		this._log.debug("Call to createPartyDao with dbEngine %j , dbPath %j", dbEngine, dbPath);
		if (dbEngine === DataSourceHandler.MONGOOSE) {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), PartyMongooseSchema), PartyDaoMongooseImpl);
		} else {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), PartyDaoLokiJsImpl);
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
		if (dbEngine === DataSourceHandler.MONGOOSE) {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AccountMongooseDbSchema), AccountDaoMongooseImpl);
		} else {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AccountDaoLokiJsImpl);
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
		if (dbEngine === DataSourceHandler.MONGOOSE) {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AuthContextMongooseDbSchema), AuthContextDaoMongooseImpl);
		} else {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AuthContextDaoLokiJsImpl);
		}
	}

	/**
	 * Gets a new Role dao, or a existing one with the same db engine and dbPath.
	 * @param dbEngine
	 * @param {string} dbPath
	 * @return {RoleDao}
	 */
	public static createRoleDao(dbEngine: any, dbPath: string): RoleDao {
		this._log.debug("Call to createRoleDao with dbEngine %j , dbPath %j", dbEngine, dbPath);
		if (dbEngine === DataSourceHandler.MONGOOSE) {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), RoleMongooseDbSchema), RoleDaoMongooseImpl);
		} else {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), RoleDaoLokiJsImpl);
		}
	}

	/**
	 * Gets a group dao.
	 * @param dbEngine
	 * @param {string} dbPath
	 * @return {GroupDao}
	 */
	public static createGroupDao(dbEngine: any, dbPath: string): GroupDao {
		this._log.debug("Call to crateGroupDao with dbEngine %j , dbPath %j", dbEngine, dbPath);
		if (dbEngine === DataSourceHandler.MONGOOSE) {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupMongooseSchema), GroupDao);
		} else {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupDao);
		}
	}

	/**
	 * Get a group content dao.
	 * @param dbEngine
	 * @param {string} dbPath
	 * @return {GroupContentDao}
	 */
	public static createGroupContentDao(dbEngine: any, dbPath: string): GroupContentDao {
		this._log.debug("Call to createGroupContentDao with dbEngine %j , dbPath %j", dbEngine, dbPath);
		if (dbEngine === DataSourceHandler.MONGOOSE) {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupContentMongooseSchema), GroupContentDao);
		} else {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupContentDao);
		}
	}

	public static createGroupAttributesDao(dbEngine: any, dbPath: string): GroupAttributeValueDao {
		this._log.debug("Call to createGroupAttributesDao with dbEngine %j , dbPath %j", dbEngine, dbPath);
		if (dbEngine === DataSourceHandler.MONGOOSE) {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupAttributeValueMongooseSchema), GroupAttributeValueDao);
		} else {
			return this.subscribeDao(new DaoSettings(dbEngine, dbPath, this.GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupAttributeValueDao);
		}
	}

	private static PARTY_DEFAULT_COLLECTION_NAME: string = "contact";
	private static ACCOUNT_DEFAULT_COLLECTION_NAME: string = "account";
	private static AUTHCONTEXT_DEFAULT_COLLECTION_NAME: string = "authcontext";
	private static ROLE_DEFAULT_COLLECTION_NAME: string = "role";
	private static GROUP_CONTENT_DEFAULT_COLLECTION_NAME: string = "groupContent";
	private static GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME: string = "groupAttribute";
	private static GROUP_DEFAULT_COLLECTION_NAME: string = "group";
	private static _log = logger.getLogger("DaoFactoryService");
	private static daos: Dao[] = [];

	private static createDbAdapter(dataSource: DataSource, daoSettings: DaoSettings) {
		let dbAdapter: DbAdapter;
		if (dataSource.dbEngine === DataSourceHandler.MONGOOSE) {
			dbAdapter = new MongooseAdapter(dataSource.dbConnection.model(daoSettings.collectionName, daoSettings.schema));
		} else {
			dbAdapter = new LokiJsAdapter(daoSettings.collectionName, dataSource.dbConnection);
		}
		return dbAdapter;
	}

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
		this._log.debug("Call to getDao with dbEngine %j, dbPath: %j, daoName %j", dbEngine, dbPath, daoName);
		const existingDaos: Dao[] = this.daos.filter((value) => value.dbEngine === dbEngine && value.daoName === daoName && value.dbPath === dbPath);
		let result: Dao;
		if (existingDaos.length === 1) {
			this._log.debug("Returning existing dao");
			result = existingDaos[0];
		} else if (existingDaos.length === 0) {
			this._log.debug("There is no dao");
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
