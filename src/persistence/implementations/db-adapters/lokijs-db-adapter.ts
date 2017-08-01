/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as _ from 'lodash';
import * as logger from 'log4js';
import {DbAdapter} from "../../api/dn-adapters/db-adapter";
import Promise = require("bluebird");
import {AttributeFilter} from "../dao/attribute-filter";

/**
 * Generic implementation of lokijs db functions
 * When calling this method. Make sure params has the
 * correct db property and the correct collection property
 */
export class LokiJsAdapter implements DbAdapter {

    private collectionName;
    private db: any;
    private _log = logger.getLogger("LokiJsAdapter");

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
    public findOneById(id: any): Promise<any> {
        this._log.debug("Call to findOne with id: %j and collection %j", id, this.getCollection().name);
        const result = this.getCollection().get(_.toNumber(id));
        if (_.isNil(result) === false) {
            result.id = result.$loki.toString();
        }
        this._log.debug('Result id %j', result);
        return Promise.resolve(result);
    }

    /**
     * Find all the documents inside a model whose ids belongs to the list.
     * @param arrayOfIds The ids to look for.
     * @return {Promise<any>} A promise containing the result. If no records are founded, then the method returns
     * an empty array.
     */
    public findByIds(arrayOfIds: any[]): Promise<any> {
        this._log.debug('Call to findByIds with collection: %j , arrayOfIds: %j', this.getCollection().name, arrayOfIds);
        const ids: number[] = [];
        for (const obj of arrayOfIds) {
            ids.push(Number(obj));
        }
        return this.findByAttributeNameIn('$loki', ids);
    }

    /**
     * Removes a document inside the collection.
     * @param objectToDelete The object to delete. This object must contain an attribute called "id" as string in
     * order to know which document to delete.
     * @return {Promise<any>} a promise indicating the operation was successful.
     */
    public remove(objectToDelete: any): Promise<any> {
        this._log.debug('Call to remove with collection: %j, objectToDelete: %j', this.getCollection().name, objectToDelete);
        return new Promise((resolve) => {
            objectToDelete.$loki = objectToDelete.id;
            this.getCollection().remove(objectToDelete);
            this.db.saveDatabase(() => {
                resolve(objectToDelete);
            });
        });
    }

    /**
     * Count all documents in the collection.
     * @return {Promise<any>} The amount of documents inside the collection.
     */
    public count(): Promise<number> {
        this._log.debug('Call to count with collection: %j', this.getCollection().name);
        const result = this.getCollection().count();
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    /**
     * Delete all documents inside the collection.
     * @return {Promise<any>} Returns a promise indicating the delete was successful.
     */
    public removeAll(): Promise<any> {
        this._log.debug('Call to removeAll with collection: %j', this.getCollection().name);
        return new Promise((resolve) => {
            this.getCollection().clear();
            this.db.saveDatabase(() => {
                resolve();
            });
        });
    }

    /**
     * Delete all documents inside the collections whose ids matches the list.
     * @param ids A list of ids.
     * @return {Promise<any>} Returns a promise indicating the delete was successful.
     */
    removeAllByIds(ids: any[]): Promise<any> {
        this._log.debug("Call to removeByIds with collection %j, ids: %j", this.getCollection().name, ids);
        const idsToDelete: number[] = ids.map((value) => Number(value));
        return new Promise((resolve) => {
            const query = {
                $loki: {$in: idsToDelete}
            };
            this.getCollection().findAndRemove(query);
            this.db.saveDatabase(() => {
                resolve();
            });
        });
    }

    /**
     * Find one document inside the collection that has the attributeName and the value.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Promise<any>} Return the document that matches the criteria. Returns a reject if there are more than
     * one document that matches the criteria.
     */
    public findOneByAttribute(attributeName: string, value): Promise<any> {
        this._log.debug('Call to findOneByAttribute with collection: %j, attributeName: %j, value: %j',
            this.getCollection().name,
            attributeName,
            value);
        const query = {};
        let result: any;
        query[attributeName] = {$eq: value};
        const resultQuery = this.getCollection().find(query);
        this._log.debug('Result %j', resultQuery);
        if (resultQuery.length === 0) {
            this._log.debug("Returning null");
            return Promise.resolve(null);
        } else if (resultQuery.length === 1) {
            result = _.clone(resultQuery[0]);
            result.id = result.$loki.toString();
            this._log.debug("Returning %j", result);
            return Promise.resolve(result);
        } else {
            this._log.warn('The query returned more than one result');
            return Promise.reject('The system returned more than one record');
        }
    }

    /**
     * Find all the documents inside the collection that has the attribute defined in the method and whose values
     * belongs to the list.
     * @param attributeName The attribute to look for.
     * @param value The values to compare.
     * @return {Promise<any>} Return the document that matches the criteria. If no records are founded, then the method
     * returns an empty array.
     */
    public findByAttribute(attributeName: string, value): Promise<any[]> {
        this._log.debug("Call to findByAttribute with attributeName: %j, value: %j, collection %j", attributeName, value, this.getCollection().name);
        const query = {};
        query[attributeName] = value;
        let result = this.getCollection().find(query);
        result = _.clone(result);
        for (const obj of result) {
            obj.id = obj.$loki.toString();
        }
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    /**
     * Find all the documents inside the collection that has the attribute defined in the method and whose values
     * belongs to the list.
     * @param attributeName The attribute to look for.
     * @param values The values to compare.
     * @return {Promise<any>}
     */
    public findByAttributeNameIn(attributeName: string, values: any[]): Promise<any> {
        this._log.debug('Call to findByAttributeNameIn with collection: %j, attributeName: %j, values: %j',
            this.getCollection().name,
            attributeName,
            values);
        const query = {};
        query[attributeName] = {$in: values};
        let result = this.getCollection().find(query);
        result = _.clone(result);
        for (const obj of result) {
            obj.id = obj.$loki.toString();
        }
        this.cleanArray(result);
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    /**
     * Insert a document inside a collection.
     * @param objectToInsert The object to insert.
     * @return {Promise<any>} The inserted object. The object contains the id generated by lokijs in a
     * attribute called "id" as string.
     */
    public insert(objectToInsert: any): Promise<any> {
        this._log.debug('Call to insert with collection: %j, objectToInsert: %j', this.getCollection().name, objectToInsert);
        return new Promise((resolve) => {
            const result = this.getCollection().insert(objectToInsert);
            this._log.debug('Result before insert %j', result);
            this.db.saveDatabase(() => {
                // Get the id generated by lokijs and store it as string.
                objectToInsert.id = result.$loki.toString();
                objectToInsert.meta = undefined;
                // Yep, we need to clone it. Because the inserted record is a direct reference to the db data.
                objectToInsert = _.clone(objectToInsert);
                this._log.debug("returning after insert: %j", objectToInsert);
                resolve(objectToInsert);
            });
        });
    }

    /**
     * Update the document info inside the collection.
     * @param objectToUpdate The data to update. This object must have an attribute called "id" as string in order
     * to know which document is going to be updated.
     * @return {Promise<any>} A promise containing the updated object.
     */
    public update(objectToUpdate: any): Promise<any> {
        this._log.debug('Call to update with collection: %j, objectToUpdate: %j', this.getCollection().name, objectToUpdate);
        return new Promise((resolve) => {
            this.getCollection().updateWhere(
                (o) => {
                    return o.$loki === Number(objectToUpdate.id);
                },
                (u) => {
                    const meta = u.meta;
                    const loki = u.$loki;
                    u = objectToUpdate;
                    u.meta = meta;
                    u.$loki = loki;
                    return u;
                });
            this.db.saveDatabase(() => {
                resolve(objectToUpdate);
            });
        });
    }

    /**
     * Insert many documents at once inside the collection.
     * @param objectsToInsert The objects to insert.
     * @return {Promise<any>} Returns a promise containing the inserted objects. Each inserted object
     * contains the generated id of lokijs inside a attribute called "id" and the type is string.
     */
    public insertMany(objectsToInsert: any[]): Promise<any> {
        this._log.debug('Call to insertMany with collection %j, objectsToInsert: %j', this.getCollection().name, objectsToInsert);
        return new Promise((resolve) => {
            let results = this.getCollection().insert(objectsToInsert);
            if (_.isArray(results) === false) {
                results = [results];
            }
            // Yep, we need to clone it. Because the inserted records are a direct reference to the db data.
            // For some reason if I don't do it. The subsequent queries return horrible results.
            results = _.clone(results);
            this.db.saveDatabase(() => {
                for (const user of results) {
                    user.id = user.$loki.toString();
                }
                resolve(results);
            });
        });
    }

    /**
     * Find all documents inside the collection.
     * @return {Promise<any>} Return a promise containing the objects.
     */
    findAll(): Promise<any[]> {
        this._log.debug("Call to findAll");
        return this.findByQuery({});
    }

    /**
     * Find all the documents that matches all attributes.
     * @param attributes The attributes-value filters.
     * @return {Promise<any>}
     */
    findByAttributesAndOperator(attributes: AttributeFilter[]): Promise<any[]> {
        this._log.debug("Call to findByAttributesAndOperator with attributes: %j", attributes);
        const query = {
            $and: []
        };
        for (const attribute of attributes) {
            const condition = {};
            condition[attribute.attributeName] = {$eq: attribute.value};
            query.$and.push(condition);
        }
        return this.findByQuery(query);
    }

    /**
     * Find all the documents that matches only one of the attributes.
     * @param attributes The attributes-value filters.
     * @return {Promise<any>}
     */
    public findByAttributesOrOperator(attributes: AttributeFilter[]): Promise<any[]> {
        this._log.debug("Call to findByAttributesOrOperator with attributes: %j", attributes);
        const query = {
            $or: []
        };
        for (const attribute of attributes) {
            const condition = {};
            condition[attribute.attributeName] = {$eq: attribute.value};
            query.$or.push(condition);
        }
        return this.findByQuery(query);
    }

    /**
     * Find all documents that matches with the query criteria. The query for the moment is a mongo-like query object.
     * @param query The query criteria.
     * @return {Promise<any>} The objects that matches the query criteria. If no records are founded, then the method
     * returns an empty array.
     */
    public findByQuery(query: any): Promise<any[]> {
        this._log.debug("Call to findByQuery with collection: %j, query: %j", this.getCollection().name, query);
        let result = this.getCollection().find(query);
        result = _.clone(result);
        for (const obj of result) {
            obj.id = obj.$loki.toString();
        }
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    /**
     * Remove a document whose id matches with the id parameter.
     * @param id The id query criteria.
     * @return {Promise} Returns a promise indicating the delete was successful.
     */
    public removeById(id: any): Promise<any> {
        this._log.debug('Call to removeById with collection: %j, id: %j', this.getCollection().name, id);
        return new Promise((resolve) => {
            const query = {
                $loki: {$eq: Number(id)}
            };
            this.getCollection().findAndRemove(query);
            this.db.saveDatabase(() => {
                resolve();
            });
        });
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

    /**
     * Removes the meta attribute that adds lokijs.
     * @param array
     */
    private cleanArray(array: any[]) {
        for (const obj of array) {
            obj.meta = undefined;
        }
    }
}
