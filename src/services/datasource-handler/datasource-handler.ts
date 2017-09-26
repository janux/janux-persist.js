/**
 * Project janux-persistence
 * Created by ernesto on 7/19/17.
 */
import {isBlankString} from "../../util/blank-string-validator";
import * as logger from '../../util/logger-api/logger-api';
import {DataSource} from "./datasource";
import {DataSourceStatus} from "./datasource-status";

/**
 * Handles a list of database dataSources.
 * The purpose of tis class is to encapsulate all the connection code from the client. With this,
 * all clients that uses the daos just needs to send the connection parameters and does no need to code
 * any connection attempt, at least for the daos.
 * All dataSources are saved in a list. Where each connection is identified by the db engine and the path.
 */
export class DataSourceHandler {

	public static readonly MONGOOSE: string = "mongoose";
	public static readonly LOKIJS: string = "lokijs";
	public static readonly DB_PATH_EMPTY = "path is empty";
	public static readonly DB_ENGINE_EMPTY = "dbEngine is empty";
	public static DB_ENGINE_INVALID = "dbEngine is invalid";

	/**
	 * Gets a dataSource. If the datasource does not exits given the params. The method creates a new one.
	 * @param {string} dbEngine The db engine, for now is "mongoose" or "lokijs"
	 * @param {string} path The path where to connect, for mongoose is a url, for lokijs is a file path.
	 * @param extraParams Extra params, for now it is not used. But I expect later might be useful.
	 * @return {Promise<DataSource>}
	 */
	public static getDataSource(dbEngine: string, path: string, extraParams: any): DataSource {
		this._log.debug("Call to getDataSource with dbEngine %j, path %j, extraParams %j", dbEngine, path, extraParams);
		if (isBlankString(dbEngine)) {
			throw  new Error(this.DB_ENGINE_EMPTY);
		} else if (dbEngine !== this.MONGOOSE && dbEngine !== this.LOKIJS) {
			throw  new Error(this.DB_ENGINE_INVALID);
		}
		if (isBlankString(path)) {
			throw  new Error(this.DB_PATH_EMPTY);
		}

		const existing: DataSource[] = this.dataSources.filter((value) => value.dbEngine === dbEngine && path === path);
		if (existing.length === 0) {
			this._log.debug("No datasource founded with the parameters %j and %j, creating a new one", dbEngine, path);
			const dataSource: DataSource = this.generateDataSource(dbEngine, path, extraParams);
			this.dataSources.push(dataSource);
			return dataSource;
		} else {
			this._log.debug("There is a datasource with the params %j and %j", dbEngine, path);
			return existing[0];
		}
	}

	private static dataSources: DataSource[] = [];
	private static _log = logger.getLogger("DataSourceHandler");

	/**
	 * Creates a new connection to the list.
	 * @param {string} dbEngine
	 * @param {string} path
	 * @param extraParams
	 * @return {DataSource}
	 */
	private static generateDataSource(dbEngine: string, path: string, extraParams: any): DataSource {
		const dataSource: DataSource = new DataSource();
		dataSource.dbEngine = dbEngine;
		dataSource.path = path;
		dataSource.extraParams = extraParams;
		dataSource.status = DataSourceStatus.DISCONNECTED;
		return dataSource;
	}
}
