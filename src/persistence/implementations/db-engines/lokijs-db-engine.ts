/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as _ from 'lodash';
import * as logger from 'log4js';
import {IDbEngine} from "../../interfaces/db-engine-intercace";
import {LokiJsUtil} from "../../util/lokijs-util";
import Promise = require("bluebird");
import {AttributeFilter} from "../dao/attribute-filter";

/**
 * Generic implementation of lokijs db functions
 * When calling this method. Make sure params has the
 * correct db property and the correct collection property
 */
export class LokiJsDbEngine implements IDbEngine {

    private collectionName;
    private db: any;
    private _log = logger.getLogger("LokiJsDbEngine");

    constructor(collectionName: string, db: any) {
        this._log.debug("Call to constructor with collectionName %j", collectionName);
        this.collectionName = collectionName;
        this.db = db;
    }

    /**
     * Find one record by the pid.
     * @param id The id to look for.
     * @return {Promise<any>} Return the document whose id matches the id. If no record is founded then the method
     * returns null.
     */
    public findOneById(id): Promise<any> {
        this._log.debug("Call to findOneById with id: %j", id);
        return LokiJsUtil.findOneById(this.getCollection(), id);
    }

    /**
     * Find all the documents inside a model whose ids belongs to the list.
     * @param arrayOfIds The ids to look for.
     * @return {Promise<any>} A promise containing the result. If no records are founded, then the method returns
     * an empty array.
     */
    public findAllByIds(arrayOfIds: any[]): Promise<any> {
        this._log.debug("Call to findAllByIds with arrayOfIds: %j", arrayOfIds);
        return LokiJsUtil.findAllByIds(this.getCollection(), arrayOfIds);
    }

    /**
     * Removes a document inside the collection.
     * @param objectToDelete The object to delete. This object must contain an attribute called "id" as string in
     * order to know which document to delete.
     * @return {Promise<any>} a promise indicating the operation was successful.
     */
    public remove(objectToDelete: any): Promise<any> {
        this._log.debug("Call to remove with objectToDelete: %j", objectToDelete);
        return LokiJsUtil.remove(this.db, this.getCollection(), objectToDelete);
    }

    /**
     * Count all documents in the collection.
     * @return {Promise<any>} The amount of documents inside the collection.
     */
    public count(): Promise<number> {
        this._log.debug("Call to count.");
        return LokiJsUtil.count(this.getCollection());
    }

    /**
     * Delete all documents inside the collection.
     * @return {Promise<any>} Returns a promise indicating the delete was successful.
     */
    public deleteAll(): Promise<any> {
        this._log.debug("Call to deleteAll.");
        return LokiJsUtil.deleteAll(this.db, this.getCollection());
    }

    /**
     * Delete all documents inside the collections whose ids matches the list.
     * @param ids A list of ids.
     * @return {Promise<any>} Returns a promise indicating the delete was successful.
     */
    deleteAllByIds(ids: string[]): Promise<any> {
        return LokiJsUtil.deleteAllByIds(this.db, this.getCollection(), ids);
    }

    /**
     * Find one document inside the collection that has the attributeName and the value.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Promise<any>} Return the document that matches the criteria. Returns a reject if there are more than
     * one document that matches the criteria.
     */
    public findOneByAttribute(attributeName: string, value): Promise<any> {
        this._log.debug("Call to findOneByAttribute with attributeName: %j, value: %j", attributeName, value);
        return LokiJsUtil.findOneByAttribute(this.getCollection(), attributeName, value);
    }

    /**
     * Find all the documents inside the collection that has the attribute defined in the method and whose values
     * belongs to the list.
     * @param attributeName The attribute to look for.
     * @param value The values to compare.
     * @return {Promise<any>} Return the document that matches the criteria. If no records are founded, then the method
     * returns an empty array.
     */
    public findAllByAttribute(attributeName: string, value): Promise<any[]> {
        this._log.debug("Call to findAllByAttribute with attributeName: %j, value: %j", attributeName, value);
        return LokiJsUtil.findAllByAttribute(this.getCollection(), attributeName, value);
    }

    /**
     * Find all the documents inside the collection that has the attribute defined in the method and whose values
     * belongs to the list.
     * @param attributeName The attribute to look for.
     * @param values The values to compare.
     * @return {Promise<any>}
     */
    public findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<any> {
        this._log.debug("Call to findAllByAttributeNameIn with attributeName: %j, values: %j", attributeName, values);
        return LokiJsUtil.findAllByAttributeNameIn(this.getCollection(), attributeName, values);
    }

    /**
     * Insert a document inside a collection.
     * @param objectToInsert The object to insert.
     * @return {Promise<any>} The inserted object. The object contains the id generated by lokijs in a
     * attribute called "id" as string.
     */
    public insert(objectToInsert: any): Promise<any> {
        this._log.debug("Call to insert with objectToInsert: %j", objectToInsert);
        return LokiJsUtil.insert(this.db, this.getCollection(), objectToInsert);
    }

    /**
     * Update the document info inside the collection.
     * @param objectToUpdate The data to update. This object must have an attribute called "id" as string in order
     * to know which document is going to be updated.
     * @return {Promise<any>} A promise containing the updated object.
     */
    public update(objectToUpdate: any): Promise<any> {
        this._log.debug("Call to update with objectToUpdate: %j", objectToUpdate);
        return LokiJsUtil.update(this.db, this.getCollection(), objectToUpdate);
    }

    /**
     * Insert many documents at once inside the collection.
     * @param objectsToInsert The objects to insert.
     * @return {Promise<any>} Returns a promise containing the inserted objects. Each inserted object
     * contains the generated id of lokijs inside a attribute called "id" and the type is string.
     */
    public insertMany(objectsToInsert: any[]): Promise<any> {
        this._log.debug("Call to insertMany with objectsToInsert: %j", objectsToInsert);
        return LokiJsUtil.insertMany(this.db, this.getCollection(), objectsToInsert);
    }

    /**
     * Find all documents inside the collection.
     * @return {Promise<any>} Return a promise containing the objects.
     */
    findAll(): Promise<any[]> {
        this._log.debug("Call to findAll");
        return LokiJsUtil.findAllByQuery(this.getCollection(), {});
    }

    /**
     * Find all the documents that matches all attributes.
     * @param attributes The attributes-value filters.
     * @return {Promise<any>}
     */
    findAllByAttributesAndOperator(attributes: AttributeFilter[]): Promise<any[]> {
        this._log.debug("Call to findAllByAttributesAndOperator with attributes: %j", attributes);
        const query = {
            $and: []
        };
        for (const attribute of attributes) {
            const condition = {};
            condition[attribute.attributeName] = {$eq: attribute.value};
            query.$and.push(condition);
        }
        return LokiJsUtil.findAllByQuery(this.getCollection(), query);
    }

    /**
     * Find all the documents that matches only one of the attributes.
     * @param attributes The attributes-value filters.
     * @return {Promise<any>}
     */
    public findAllByAttributesOrOperator(attributes: AttributeFilter[]): Promise<any[]> {
        this._log.debug("Call to findAllByAttributesOrOperator with attributes: %j", attributes);
        const query = {
            $or: []
        };
        for (const attribute of attributes) {
            const condition = {};
            condition[attribute.attributeName] = {$eq: attribute.value};
            query.$or.push(condition);
        }
        return LokiJsUtil.findAllByQuery(this.getCollection(), query);
    }

    /**
     * Find all documents that matches with the query criteria. The query for the moment is a mongo-like query object.
     * @param query The query criteria.
     * @return {Promise<any>} The objects that matches the query criteria. If no records are founded, then the method
     * returns an empty array.
     */
    public findAllByQuery(query: any): Promise<any[]> {
        this._log.debug("Call to findAllByQuery with query: %j", query);
        return LokiJsUtil.findAllByQuery(this.getCollection(), query);
    }

    /**
     * Remove a document whose id matches with the id parameter.
     * @param id The id query criteria.
     * @return {Promise} Returns a promise indicating the delete was successful.
     */
    public removeById(id: string): Promise<any> {
        this._log.debug("Call to removeById with id: %j", id);
        return LokiJsUtil.removeById(this.db, this.getCollection(), id);
    }

    private getCollection(): any {
        this._log.debug("Call to getCollection with %j", this.collectionName);
        let collection = this.db.getCollection(this.collectionName);
        if (_.isNil(collection)) {
            this._log.debug("No collection founded with name %j, adding a new one", this.collectionName);
            collection = this.db.addCollection(this.collectionName);
        }
        return collection;
    }
}
