/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

import * as logger from 'log4js';
import {CrudRepository} from "../../api/dao/crud-reporitory";
import Promise = require("bluebird");
import {DbAdapter} from "../../api/dn-adapters/db-adapter";
import {AbstractDataAccessObject} from "./abstract-data-access-object";
import {AttributeFilter} from "./attribute-filter";
import {EntityPropertiesImpl} from "./entity-properties";

/**
 * This class, inside their properties, contains an object implementing the interface DbAdapter where you can do
 * db operations.
 * The purpose of this class is to encapsulate the db calls inside an object. And that object re-use ti
 * in different dao implementations.
 */
export abstract class AbstractDataAccessObjectWithAdapter<t> extends AbstractDataAccessObject<t> {

    // This class holds all common db engine methods
    protected dbAdapter: DbAdapter;

    private readonly _logger = logger.getLogger("AbstractDataAccessObjectWithAdapter");

    /**
     * Constructor
     * @param {DbAdapter} dbAdapter This contains an implementation of CrudRepository.
     * The idea is there are CrudRepository implementations per engine. In order to
     * remove duplicated code per each db implementation.
     * @param {EntityPropertiesImpl} entityProperties
     */
    constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
        super(entityProperties);
        this._logger.debug("Calling constructor");
        this.dbAdapter = dbAdapter;
        this.entityProperties = entityProperties;
    }

    /**
     * Remove an object in the database.
     * WARNING: This method IS NOT protected by any relational integrity rule because
     * noSql databases doesn't have this feature. Be VERY, VERY careful when calling this method.
     * Nothing (you, the db engine or anything else) will stop the operation once called.
     * The method is removed by calling dbAdapter.remove.
     * @param objectToDelete The object to delete
     */
    public remove(objectToDelete: t): Promise<any> {
        return this.dbAdapter.remove(objectToDelete);
    }

    /**
     * Same as remove. But you send an id.
     * @param id
     * @return {Promise<any>}
     */
    public removeById(id: any): Promise<any> {
        return this.dbAdapter.removeById(id);
    }

    /**
     * Returns the amount of records that has the entity
     */
    public count(): Promise<number> {
        return this.dbAdapter.count();
    }

    /**
     * Delete all records.
     * WARNING: This method IS NOT protected by any relational integrity rule because
     * noSql databases doesn't have this feature. Be VERY, VERY careful when calling this method,
     * you can destroy your database data integrity so easily.
     * Nothing (you, the db engine or anything else) will stop the operation once called.
     */
    public  removeAll(): Promise<any> {
        return this.dbAdapter.removeAll();
    }

    /**
     * Delete all records whose ids matches the list.
     * @param ids A list of ids.
     * @return {Promise<any>} Returns a promise indicating the delete was successful.
     */
    public removeByIds(ids: any[]): Promise<any> {
        return this.dbAdapter.removeAllByIds(ids);
    }

    /**
     * Returns all records.
     * @return {Promise<any[]>}
     */
    protected findAllMethod(): Promise<t[]> {
        return this.dbAdapter.findAll();
    }

    /**
     * Find one record by the id.
     * @param id The id to look for.
     * @return {Promise<any>} Return the document whose id matches the id. If no record is founded then the method
     * returns null.
     */
    protected findOneByIdMethod(id: any): Promise<t> {
        return this.dbAdapter.findOneById(id);
    }

    /**
     * Find all the documents inside a model whose ids belongs to the list.
     * @param arrayOfIds The ids to look for.
     * @return A promise containing the result. If no records are founded, then the method returns
     * an empty array.
     */
    protected  findByIdsMethod(arrayOfIds: any[]): Promise<t[]> {
        return this.dbAdapter.findByIds(arrayOfIds);
    }

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return only one record,
     * and send an error if the query returned more than one result.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected findOneByAttributeMethod(attributeName: string, value): Promise<t> {
        return this.dbAdapter.findOneByAttribute(attributeName, value);
    }

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return an array with the results,
     * or an empty array if the query returned nothing.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected findByAttributeMethod(attributeName: string, value): Promise<t[]> {
        return this.dbAdapter.findByAttribute(attributeName, value);
    }

    /**
     * Perform a query where the method filter an attribute by several values.
     * @param attributeName The attribute to look for.
     * @param values The list of values to filter.
     */
    protected findByAttributeNameInMethod(attributeName: string, values: any[]): Promise<t[]> {
        return this.dbAdapter.findByAttributeNameIn(attributeName, values);
    }

    /**
     * Perform a query with the and operator for every attribute and value
     * @param attributes The attributes to filter
     */
    protected findByAttributesAndOperatorMethod(attributes: AttributeFilter[]): Promise<t[]> {
        return this.dbAdapter.findByAttributesAndOperator(attributes);
    }

    /**
     * Perform a query with the or operator for every attribute and value
     * @param attributes The attributes to filter
     */
    protected findByAttributesOrOperatorMethod(attributes: AttributeFilter[]): Promise<t[]> {
        return this.dbAdapter.findByAttributesOrOperator(attributes);
    }

    /**
     * Inserts an object in the database.
     * @param objectToInsert The object to insert
     */
    protected insertMethod(objectToInsert: t): Promise<t> {
        return this.dbAdapter.insert(objectToInsert);
    }

    /**
     * Update an object in the database
     * @param objectToUpdate The object to update
     */
    protected  updateMethod(objectToUpdate: t): Promise<t> {
        return this.dbAdapter.update(objectToUpdate);
    }

    /**
     * Inserts several object to the database at once.
     * @param objectsToInsert The objects to insert
     */
    protected  insertManyMethod(objectsToInsert: t[]): Promise<any> {
        return this.dbAdapter.insertMany(objectsToInsert);
    }

    /**
     * Return the objects that matches the query criteria.
     * @param query A mongoose like query.
     * @return {Promise<any[]>}
     */
    protected findByQueryMethod(query: any): Promise<any> {
        return this.dbAdapter.findByQuery(query);
    }
}
