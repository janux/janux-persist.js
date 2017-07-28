/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */

import * as Promise from 'bluebird';
import {LoggerFactory} from "../../util/logger-factory/logger_factory";

/**
 * Lokijs db functions util.
 * Almost all the method has the following responsibilities.
 * Because LokiJs stores an unique id called $loki per each document and the attribute is a number, most of the methods
 * inside this class retrieve the $loki attribute and store it inside the "id" attribute as string.
 * Because lokijs is a in-memory database, the objects returned by loki are a direct reference to the database.
 * Any change to the object is a direct change to the database.
 * In order to avoid problems most of the methods apply a clone object.
 */
export class LokiJsUtil {
    /**
     * Find one record by the id.
     * @param collection Collection to look inside.
     * @param id The id to look for.
     * @return {Promise<any>} Return the document whose id matches the id. If no record is founded then the method
     * returns null.
     */
    public static findOneById(collection: any, id: any): Promise<any> {
        this._log.debug('Call to findOneById with ', id);
        const result = collection.get(Number(id));
        if (result != null) {
            result.id = result.$loki.toString();
        }
        this._log.debug('Result id %j', result);
        return Promise.resolve(result);
    }

    /**
     * Find all the documents inside a collection whose ids belongs to the list.
     * @param collection The collection to look inside.
     * @param arrayOfIds The ids to look for.
     * @return {Promise<any>} A promise containing the result. If no records are founded, then the method returns
     * an empty array.
     */
    public static findAllByIds(collection, arrayOfIds: any[]): Promise<any> {
        this._log.debug('Call to findAllByIds with collection: %j , arrayOfIds: %j', collection.name, arrayOfIds);
        const ids: number[] = [];
        for (const obj of arrayOfIds) {
            ids.push(Number(obj));
        }
        return this.findAllByAttributeNameIn(collection, '$loki', ids);
    }

    /**
     * Count all documents in the collection.
     * @param collection The collection to count.
     * @return {Promise<any>} The amount of documents inside the collection.
     */
    public static count(collection): Promise<any> {
        this._log.debug('Call to count with collection: %j', collection.name);
        const result = collection.count();
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    /**
     * Find all the documents inside the collection that has the attributeName and the value.
     * @param collection The collection to look inside.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Promise<any>} Return a list of documents that matches the criteria. If no records are founded, then the method
     * returns an empty array.
     */
    public static findAllByAttribute(collection: any, attributeName: string, value: any): Promise<any> {
        this._log.debug('Call to findAllByAttribute with collection: %j, attributeName: %j, value: %j',
            collection.name,
            attributeName,
            value);
        const query = {};
        query[attributeName] = value;
        let result = collection.find(query);
        // result = _.clone(result);
        result = Object.create(result);
        for (const obj of result) {
            obj.id = obj.$loki.toString();
        }
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    /**
     * Find all documents that matches with the query criteria. The query is a mongo-like query object.
     * @param collection The collection to look inside.
     * @param query The query criteria.
     * @return {Promise<any>} The objects that matches the query criteria. If no records are founded, then the method
     * returns an empty array.
     */
    public static findAllByQuery(collection: any, query: any): Promise<any> {
        this._log.debug("Call to findAllByQuery with collection: %j, query: %j", collection.name, query);
        let result = collection.find(query);
        // result = _.clone(result);
        result = Object.create(result);
        for (const obj of result) {
            obj.id = obj.$loki.toString();
        }
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    /**
     * Find one document inside the collection that has the attributeName and the value.
     * @param collection The collection to look inside.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Promise<any>} Return the document that matches the criteria. Returns a reject if there are more than
     * one document that matches the criteria.
     */
    public static findOneByAttribute(collection: any, attributeName: string, value: any): Promise<any> {
        this._log.debug('Call to findOneByAttribute with collection: %j, attributeName: %j, value: %j',
            collection.name,
            attributeName,
            value);
        const query = {};
        let result: any;
        query[attributeName] = {$eq: value};
        const resultQuery = collection.find(query);
        this._log.debug('Result %j', resultQuery);
        if (resultQuery.length === 0) {
            this._log.debug("Returning null");
            return Promise.resolve(null);
        } else if (resultQuery.length === 1) {
            // result = _.clone(resultQuery[0]);
            result = Object.create(resultQuery[0]);
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
     * @param collection The collection to look inside.
     * @param attributeName The attribute to look for.
     * @param values The values to compare.
     * @return {Promise<any>}  Return the document that matches the criteria. If no records are founded, then the method
     * returns an empty array.
     */
    public static findAllByAttributeNameIn(collection: any, attributeName: string, values: any[]): Promise<any> {
        this._log.debug('Call to findAllByAttributeNameIn with collection: %j, attributeName: %j, values: %j',
            collection.name,
            attributeName,
            values);
        const query = {};
        query[attributeName] = {$in: values};
        let result = collection.find(query);
        // result = _.clone(result);
        result = Object.create(result);
        for (const obj of result) {
            obj.id = obj.$loki.toString();
        }
        this.cleanArray(result);
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    /**
     * Insert a document inside the collection.
     * @param db The lokijs database to insert the document.
     * @param collection The collection where to insert the document.
     * @param objectToInsert The data to insert.
     * @return {Promise<any>} The inserted object. The object contains the id generated by lokijs in a
     * attribute called "id" as string.
     */
    public static insert(db: any, collection: any, objectToInsert: any): Promise<any> {
        this._log.debug('Call to insert with collection: %j, objectToInsert: %j', collection.name, objectToInsert);
        return new Promise((resolve) => {
            const result = collection.insert(objectToInsert);
            this._log.debug('Result before insert %j', result);
            db.saveDatabase(() => {
                // Get the id generated by lokijs and store it as string.
                objectToInsert.id = result.$loki.toString();
                objectToInsert.meta = undefined;
                // Yep, we need to clone it. Because the inserted record is a direct reference to the db data.
                // objectToInsert = _.clone(objectToInsert);
                objectToInsert = Object.create(objectToInsert);
                this._log.debug("returning after insert: %j", objectToInsert);
                resolve(objectToInsert);
            });
        });
    }

    /**
     * Delete all documents inside the collection.
     * @param db The lokijs database.
     * @param collection The collection to delete.
     * @return {Promise} Returns a promise indicating the delete was successful.
     */
    public static deleteAll(db: any, collection: any): Promise<any> {
        this._log.debug('Call to deleteAll with collection: %j', collection.name);
        return new Promise((resolve) => {
            collection.clear();
            db.saveDatabase(() => {
                resolve();
            });
        });
    }

    /**
     * Delete all documents inside the collections whose ids matches the list.
     * @param db The lokijs database.
     * @param collection The collection whose documents are going to be deleted.
     * @param ids A list of ids.
     * @return {Promise} Returns a promise indicating the delete was successful.
     */
    public static deleteAllByIds(db: any, collection: any, ids: string[]): Promise<any> {
        this._log.debug("Call to deleteAllByIds with collection %j, ids: %j", collection.name, ids);
        const idsToDelete: number[] = ids.map((value) => Number(value));
        return new Promise((resolve) => {
            const query = {
                $loki: {$in: idsToDelete}
            };
            collection.findAndRemove(query);
            db.saveDatabase(() => {
                resolve();
            });
        });
    }

    /**
     * Insert many documents at once inside the collection.
     * @param db The lokijs database.
     * @param collection The collection where the data is going to be inserted.
     * @param objectsToInsert The objects to insert.
     * @return {Promise<any>} Returns a promise containing the inserted objects. Each inserted object
     * contains the generated id of lokijs inside a attribute called "id" and the type is string.
     */
    public static insertMany(db: any, collection: any, objectsToInsert: any[]): Promise<any> {
        this._log.debug('Call to insertMany with collection %j, objectsToInsert: %j', collection.name, objectsToInsert);
        return new Promise((resolve) => {
            let results = collection.insert(objectsToInsert);

            // lokijs does not return an array if the amount of objects to insert is 1.
            if (Array.isArray(results) === false) {
                results = [results];
            }
            // if (_.isArray(results) === false) {
            //     results = [results];
            // }
            // Yep, we need to clone it. Because the inserted records are a direct reference to the db data.
            // For some reason if I don't do it. The subsequent queries return horrible results.
            // results = _.clone(results);
            results = Object.create(results);
            db.saveDatabase(() => {
                for (const user of results) {
                    user.id = user.$loki.toString();
                }
                resolve(results);
            });
        });
    }

    /**
     * Update the document info inside the collection.
     * @param db The lokijs database.
     * @param collection The collection where the document resides.
     * @param objectToUpdate The data to update. This object must have an attribute called "id" as string in order
     * to know which document is going to be updated.
     * @return {Promise<any>} A promise containing the updated object.
     */
    public static update(db: any, collection: any, objectToUpdate: any): Promise<any> {
        this._log.debug('Call to update with collection: %j, objectToUpdate: %j', collection.name, objectToUpdate);
        return new Promise((resolve) => {
            collection.updateWhere(
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
            db.saveDatabase(() => {
                resolve(objectToUpdate);
            });
        });
    }

    /**
     * Remove a document inside the collection.
     * @param db The lokijs database.
     * @param collection The collection that has the document to be deleted.
     * @param objectToDelete The object to delete. This object must contain an attribute called "id" as string in
     * order to know which document to delete.
     * @return {Promise} a promise indicating the operation was successful.
     */
    public static remove(db: any, collection: any, objectToDelete: any): Promise<any> {
        this._log.debug('Call to remove with collection: %j, objectToDelete: %j', collection.name, objectToDelete);
        return new Promise((resolve) => {
            objectToDelete.$loki = objectToDelete.id;
            collection.remove(objectToDelete);
            db.saveDatabase(() => {
                resolve(objectToDelete);
            });
        });
    }

    /**
     * Remove a document whose id matches with the id parameter.
     * @param db A lokijs database.
     * @param collection The collection that has the document to be deleted.
     * @param id The id query criteria.
     * @return {Promise} Returns a promise indicating the delete was successful.
     */
    public static removeById(db: any, collection: any, id: string) {
        this._log.debug('Call to removeById with collection: %j, id: %j', collection.name, id);
        return new Promise((resolve) => {
            const query = {
                $loki: {$eq: Number(id)}
            };
            collection.findAndRemove(query);
            db.saveDatabase(() => {
                resolve();
            });
        });
    }

    private static _log = LoggerFactory.getLogger('LokiJsUtil');

    /**
     * Removes the meta attribute that adds lokijs.
     * @param array
     */
    private static cleanArray(array: any[]) {
        for (const obj of array) {
            obj.meta = undefined;
        }
    }
}
