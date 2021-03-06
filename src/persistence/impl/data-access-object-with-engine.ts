/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

import * as logger from 'log4js';
import uuid = require("uuid");
import {IDbEngineUtil} from "../interfaces/db-engine-util-method";
import Promise = require("bluebird");
import {IEntityProperties} from "../interfaces/entity-properties";
import {DataAccessObject} from "./data-access-object";
/**
 * Tish class, inside their properties,contains a generic interface where the class
 * can perform the basic db operations.
 */
export abstract class DataAccessObjectWithEngine<t> extends DataAccessObject<t> {

    // This class holds all common db engine methods
    protected dbEngineUtil: IDbEngineUtil;

    private readonly _logger = logger.getLogger("DataAccessObject");

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(entityProperties);
        this._logger.debug("Calling constructor");
        this.dbEngineUtil = dbEngineUtil;
        this.entityProperties = entityProperties;
    }

    /**
     * Query an object by the id.
     * @param id The id.
     */
    public findOneById(id: any): Promise<t> {
        return this.dbEngineUtil.findOneById(id);
    }

    /**
     * Query several objects by a array of ids.
     * @param arrayOfIds An array of ids.
     */
    public  findAllByIds(arrayOfIds: any[]): Promise<t[]> {
        return this.dbEngineUtil.findAllByIds(arrayOfIds);
    }

    /**
     * This method must be implemented in order to delete an record to the database.
     * @param objectToDelete The object to delete
     */
    public remove<t>(objectToDelete: t): Promise<any> {
        return this.dbEngineUtil.remove(objectToDelete);
    }

    /**
     * Returns the amount of records that has the entity
     */
    public  count(): Promise<number> {
        return this.dbEngineUtil.count();
    }

    /**
     * Delete all records
     */
    public  deleteAll(): Promise<any> {
        return this.dbEngineUtil.deleteAll();
    }

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return only one record,
     * and send an error if the query returned more than one result.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected findOneByAttribute(attributeName: string, value): Promise<t> {
        return this.dbEngineUtil.findOneByAttribute(attributeName, value);
    }

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return an array with the results,
     * or an empty array if the query returned nothing.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected findAllByAttribute(attributeName: string, value): Promise<t[]> {
        return this.dbEngineUtil.findAllByAttribute(attributeName, value);
    }

    /**
     * Perform a query where the method filter an attribute by several values.
     * @param attributeName The attribute to look for.
     * @param values The list of values to filter.
     */
    protected findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<t[]> {
        return this.dbEngineUtil.findAllByAttributeNameIn(attributeName, values);
    }

    /**
     * This method must be implemented in order to insert an object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectToInsert The object to insert
     */
    protected insertMethod<t>(objectToInsert: t): Promise<t> {
        return this.dbEngineUtil.insertMethod(objectToInsert);
    }

    /**
     * This method must be implemented in order to update an object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectToUpdate The object to update
     */
    protected  updateMethod<t>(objectToUpdate: t): Promise<t> {
        return this.dbEngineUtil.updateMethod(objectToUpdate);
    }

    /**
     * This method must be implemented in order to insert several object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectsToInsert The objects to insert
     */
    protected  insertManyMethod<t>(objectsToInsert: t[]): Promise<any> {
        return this.dbEngineUtil.insertManyMethod(objectsToInsert);
    }
}
