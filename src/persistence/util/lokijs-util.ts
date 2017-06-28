/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */

import * as _ from 'lodash';
import Promise = require('bluebird');
import * as logger from 'log4js';

/**
 * Lokijs db functions util
 */
export class LokiJsUtil {
    public static findOneById(collection: any, id: any): Promise<any> {
        this._log.debug('Call to findOneById with ', id);
        const result = collection.get(_.toNumber(id));
        this._log.debug('Result id %j', result);
        return Promise.resolve(result);
    }

    public static findAllByIds(collection, arrayOfIds: any[]): Promise<any> {
        this._log.debug('Call to findAllByIds with collection: %j , arrayOfIds: %j', collection.name, arrayOfIds);
        const ids: number[] = [];
        for (const obj of arrayOfIds) {
            ids.push(Number(obj));
        }
        return this.findAllByAttributeNameIn(collection, '$loki', ids);
    }

    public static count(collection): Promise<any> {
        this._log.debug('Call to count with collection: %j', collection.name);
        const result = collection.count();
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    public static findAllByAttribute(collection: any, attributeName: string, value: any): Promise<any> {
        this._log.debug('Call to findAllByAttribute with collection: %j, attributeName: %j, value: %j',
            collection.name,
            attributeName,
            value);
        const query = {};
        query[attributeName] = value;
        const result = collection.find(query);
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    public static findAllByQuery(collection: any, query: any): Promise<any> {
        this._log.debug("Call to findAllByQuery with collection: %j, query: %j", collection.name, query);
        const result = collection.find(query);
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    public static findOneByAttribute(collection: any, attributeName: string, value: any): Promise<any> {
        this._log.debug('Call to findOneByAttribute with collection: %j, attributeName: %j, value: %j',
            collection.name,
            attributeName,
            value);
        const query = {};
        query[attributeName] = {$eq: value};
        const result = collection.find(query);
        this._log.debug('Result %j', result);
        if (result.length === 0) {
            return Promise.resolve(null);
        } else if (result.length === 1) {
            this._log.debug("Returning %j", result[0]);
            return Promise.resolve(result[0]);
        } else {
            this._log.warn('The query returned more than one result');
            return Promise.reject('The system returned more than one record');
        }
    }

    public static findAllByAttributeNameIn(collection: any, attributeName: string, values: any[]): Promise<any> {
        this._log.debug('Call to findAllByAttributeNameIn with collection: %j, attributeName: %j, values: %j',
            collection.name,
            attributeName,
            values);
        const query = {};
        query[attributeName] = {$in: values};
        let result = collection.find(query);
        result = _.clone(result);
        this.cleanArray(result);
        this._log.debug('Result %j', result);
        return Promise.resolve(result);
    }

    public static insert(db: any, collection: any, objectTOInsert: any): Promise<any> {
        this._log.debug('Call to insert with collection: %j, objectTOInsert: %j', collection.name, objectTOInsert);
        return new Promise((resolve, reject) => {
            const result = collection.insert(objectTOInsert);
            this._log.debug('Result before insert %j', result);
            db.saveDatabase(() => {
                objectTOInsert.id = result.$loki.toString();
                objectTOInsert.meta = undefined;
                // Yep, we need to clone it. Because the inserted record is a direct reference to the db data.
                objectTOInsert = _.clone(objectTOInsert);
                this._log.debug("returning after insert: %j", objectTOInsert);
                resolve(objectTOInsert);
            });
        });
    }

    public static deleteAll(db: any, collection: any): Promise<any> {
        this._log.debug('Call to deleteAll with collection: %j', collection.name);
        return new Promise((resolve) => {
            collection.clear();
            db.saveDatabase(() => {
                resolve();
            });
        });
    }

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

    public static insertMany(db: any, collection: any, objectsToInsert: any[]): Promise<any> {
        this._log.debug('Call to insertMany with collection %j, objectsToInsert: %j', collection.name, objectsToInsert);
        return new Promise((resolve, reject) => {
            let results = collection.insert(objectsToInsert);
            if (_.isArray(results) === false) {
                results = [results];
            }
            // Yep, we need to clone it. Because the inserted records are a direct reference to the db data.
            // For some reason if I don't do it. The subsequent queries return horrible results.
            results = _.clone(results);
            db.saveDatabase(() => {
                for (const user of results) {
                    user.id = user.$loki.toString();
                }
                resolve(results);
            });
        });
    }

    public static update(db: any, collection: any, objectToUpdate: any): Promise<any> {
        this._log.debug('Call to update with collection: %j, objectToUpdate: %j', collection.name, objectToUpdate);
        return new Promise((resolve, reject) => {
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

    public static remove(db: any, collection: any, objectToDelete: any): Promise<any> {
        this._log.debug('Call to remove with collection: %j, objectToDelete: %j', collection.name, objectToDelete);
        return new Promise((resolve, reject) => {
            objectToDelete.$loki = objectToDelete.id;
            collection.remove(objectToDelete);
            db.saveDatabase(() => {
                resolve(objectToDelete);
            });
        });
    }

    private static _log = logger.getLogger('LokiJsUtil');

    private static cleanArray(array: any[]) {
        for (const obj of array) {
            obj.meta = undefined;
        }
    }
}
