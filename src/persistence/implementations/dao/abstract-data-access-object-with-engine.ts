/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

import * as logger from 'log4js';
import {ICrudRepository} from "../../interfaces/crud-reporitory";
import Promise = require("bluebird");
import {IDbEngine} from "../../interfaces/db-engine-intercace";
import {IEntityProperties} from "../../interfaces/entity-properties";
import {AbstractDataAccessObject} from "./abstract-data-access-object";
import {AttributeFilter} from "./attribute-filter";

/**
 * This class, inside their properties, contains an object implementing the interface ICrudRepository where you can do
 * db operations.
 * The purpose of this class is to encapsulate the db calls inside an object. And that object re-use ti
 * in different dao implementations.
 */
export abstract class AbstractDataAccessObjectWithEngine<t> extends AbstractDataAccessObject<t> {

    // This class holds all common db engine methods
    protected dbEngineUtil: IDbEngine;

    private readonly _logger = logger.getLogger("AbstractDataAccessObjectWithEngine");

    /**
     * Constructor
     * @param {ICrudRepository} dbEngineUtil This contains an implementation of ICrudRepository.
     * The idea is there are ICrudRepository implementations per engine. In order to
     * remove duplicated code per each db implementation.
     * @param {IEntityProperties} entityProperties
     */
    constructor(dbEngineUtil: IDbEngine, entityProperties: IEntityProperties) {
        super(entityProperties);
        this._logger.debug("Calling constructor");
        this.dbEngineUtil = dbEngineUtil;
        this.entityProperties = entityProperties;
    }

    /**
     * Remove an object in the database.
     * WARNING: This method IS NOT protected by any relational integrity rule because
     * noSql databases doesn't have this feature. Be VERY, VERY careful when calling this method.
     * Nothing (you, the db engine or anything else) will stop the operation once called.
     * The method is removed by calling dbEngineUtil.remove.
     * @param objectToDelete The object to delete
     */
    public remove(objectToDelete: t): Promise<any> {
        return this.dbEngineUtil.remove(objectToDelete);
    }

    /**
     * Same as remove. But you send an id.
     * @param id
     * @return {Promise<any>}
     */
    public removeById(id: string): Promise<any> {
        return this.dbEngineUtil.removeById(id);
    }

    /**
     * Returns the amount of records that has the entity
     */
    public count(): Promise<number> {
        return this.dbEngineUtil.count();
    }

    /**
     * Delete all records.
     * WARNING: This method IS NOT protected by any relational integrity rule because
     * noSql databases doesn't have this feature. Be VERY, VERY careful when calling this method,
     * you can destroy your database data integrity so easily.
     * Nothing (you, the db engine or anything else) will stop the operation once called.
     */
    public  deleteAll(): Promise<any> {
        return this.dbEngineUtil.deleteAll();
    }

    /**
     * Delete all records whose ids matches the list.
     * @param ids A list of ids.
     * @return {Promise<any>} Returns a promise indicating the delete was successful.
     */
    public deleteAllByIds(ids: string[]): Promise<any> {
        return this.dbEngineUtil.deleteAllByIds(ids);
    }

    /**
     * Returns all records.
     * @return {Promise<any[]>}
     */
    protected findAllMethod(): Promise<t[]> {
        return this.dbEngineUtil.findAll();
    }

    /**
     * Find one record by the id.
     * @param id The id to look for.
     * @return {Promise<any>} Return the document whose id matches the id. If no record is founded then the method
     * returns null.
     */
    protected findOneByIdMethod(id: string): Promise<t> {
        return this.dbEngineUtil.findOneById(id);
    }

    /**
     * Find all the documents inside a model whose ids belongs to the list.
     * @param arrayOfIds The ids to look for.
     * @return A promise containing the result. If no records are founded, then the method returns
     * an empty array.
     */
    protected  findAllByIdsMethod(arrayOfIds: any[]): Promise<t[]> {
        return this.dbEngineUtil.findAllByIds(arrayOfIds);
    }

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return only one record,
     * and send an error if the query returned more than one result.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected findOneByAttributeMethod(attributeName: string, value): Promise<t> {
        return this.dbEngineUtil.findOneByAttribute(attributeName, value);
    }

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return an array with the results,
     * or an empty array if the query returned nothing.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected findAllByAttributeMethod(attributeName: string, value): Promise<t[]> {
        return this.dbEngineUtil.findAllByAttribute(attributeName, value);
    }

    /**
     * Perform a query where the method filter an attribute by several values.
     * @param attributeName The attribute to look for.
     * @param values The list of values to filter.
     */
    protected findAllByAttributeNameInMethod(attributeName: string, values: any[]): Promise<t[]> {
        return this.dbEngineUtil.findAllByAttributeNameIn(attributeName, values);
    }

    /**
     * Perform a query with the and operator for every attribute and value
     * @param attributes The attributes to filter
     */
    protected findAllByAttributesAndOperatorMethod(attributes: AttributeFilter[]): Promise<t[]> {
        return this.dbEngineUtil.findAllByAttributesAndOperator(attributes);
    }

    /**
     * Perform a query with the or operator for every attribute and value
     * @param attributes The attributes to filter
     */
    protected findAllByAttributesOrOperatorMethod(attributes: AttributeFilter[]): Promise<t[]> {
        return this.dbEngineUtil.findAllByAttributesOrOperator(attributes);
    }

    /**
     * Inserts an object in the database.
     * @param objectToInsert The object to insert
     */
    protected insertMethod(objectToInsert: t): Promise<t> {
        return this.dbEngineUtil.insert(objectToInsert);
    }

    /**
     * Update an object in the database
     * @param objectToUpdate The object to update
     */
    protected  updateMethod(objectToUpdate: t): Promise<t> {
        return this.dbEngineUtil.update(objectToUpdate);
    }

    /**
     * Inserts several object to the database at once.
     * @param objectsToInsert The objects to insert
     */
    protected  insertManyMethod(objectsToInsert: t[]): Promise<any> {
        return this.dbEngineUtil.insertMany(objectsToInsert);
    }

    /**
     * Return the objects that matches the query criteria.
     * @param query A mongoose like query.
     * @return {Promise<any[]>}
     */
    protected findAllByQueryMethod(query: any): Promise<any> {
        return this.dbEngineUtil.findAllByQuery(query);
    }
}
