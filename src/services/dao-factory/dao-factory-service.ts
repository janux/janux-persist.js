/**
 * Project janux-persistence
 * Created by ernesto on 7/19/17.
 */

import { DbAdapter } from "persistence/api/db-adapters/db-adapter";
import { LokiJsAdapter } from "persistence/implementations/db-adapters/lokijs-db-adapter";
import { MongooseAdapter } from "persistence/implementations/db-adapters/mongoose-db-adapter";
import { DaoSettings } from "services/dao-factory/dao-settings";
import { DataSource } from "services/datasource-handler/datasource";
import { DataSourceHandler } from "services/datasource-handler/datasource-handler";
import * as logger from "utils/logger-api/logger-api";
import { Dao } from "./dao";

/**
 * This class helps to generate the daos with only the database params.
 * Given the database params, this class hides which implementation classes are used.
 */
export class DaoFactory {
	public static subscribeDao<T>(daoSettings: DaoSettings, classReference: any): T {
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

	private static _log = logger.getLogger("DaoFactoryService");
	private static daos: Dao[] = [];

	private static createDbAdapter(dataSource: DataSource, daoSettings: DaoSettings) {
		let dbAdapter: DbAdapter;
		if (dataSource.dbEngine === DataSourceHandler.MONGOOSE) {
			dbAdapter = new MongooseAdapter(
				dataSource.dbConnection.model(daoSettings.collectionName, daoSettings.schema)
			);
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
		const existingDaos: Dao[] = this.daos.filter(
			value => value.dbEngine === dbEngine && value.daoName === daoName && value.dbPath === dbPath
		);
		let result: Dao;
		if (existingDaos.length === 1) {
			this._log.debug("Returning existing dao");
			result = existingDaos[0];
		} else if (existingDaos.length === 0) {
			this._log.debug("There is no dao");
			result = undefined;
		} else {
			throw new Error("There is more than one dao with the same features");
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
