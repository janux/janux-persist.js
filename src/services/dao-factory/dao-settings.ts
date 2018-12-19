/**
 * Project janux-persist.js
 * Created by ernesto on 10/19/17.
 */
import { Schema } from "mongoose";
import { EntityPropertiesImpl } from "persistence/implementations/dao/entity-properties";

export class DaoSettings {
	public dbEngine: string;
	public dbPath: string;
	public collectionName: string;
	public entityProperties: EntityPropertiesImpl;
	public schema: Schema;

	constructor(
		dbEngine: string,
		dbPath: string,
		collectionName: string,
		entityProperties: EntityPropertiesImpl,
		schema?: Schema
	) {
		this.dbEngine = dbEngine;
		this.dbPath = dbPath;
		this.collectionName = collectionName;
		this.entityProperties = entityProperties;
		this.schema = schema;
	}
}
