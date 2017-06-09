/**
 * Project glarus-system
 * Created by ernesto on 5/30/17.
 */

import * as logger from 'log4js';
import mongoose = require('mongoose');
import {Model} from 'mongoose';
import Promise = require('bluebird');

export class MongoDbUtil {

    public static findOneById(model: Model<any>, id: any): Promise<any> {
        this._log.debug('Call to findOneById with id: %j ', id);
        return new Promise((resolve, reject) => {
            const query = {_id: mongoose.Types.ObjectId(id)};
            model.findOne(query).lean().exec((err, result: any) => {
                if (err) throw err;
                if (result !== null) {
                    result.id = result._id.toString();
                }
                resolve(result);
            });
        });
    }

    public static findAllByIds(model: Model<any>, arrayOfIds: any[]): Promise<any> {
        this._log.debug('Call to findAllByIds with arrayOfIds: %j ', arrayOfIds);
        return new Promise((resolve, reject) => {
            const query = {
                _id: {$in: arrayOfIds}
            };
            model.find(query).lean().exec((err, result) => {
                if (err) throw err;
                resolve(result);
            });
        });
    }

    public static count(model: Model<any>): Promise<any> {
        this._log.debug("Call to count");
        return new Promise((resolve, reject) => {
            model.count({}, (err, count) => {
                if (err) throw err;
                resolve(count);
            });
        });
    }

    public static findOneByAttribute(model: Model<any>, attributeName: string, value: any): Promise<any> {
        this._log.debug("Call to findOneByAttribute with attributeName: %j + value: %j", attributeName, value);
        return new Promise((resolve, reject) => {
            const query = {};
            query[attributeName] = value;
            model.find(query).lean().exec((err, result: any[]) => {
                if (err) throw err;
                if (result.length === 0) {
                    resolve(null);
                } else if (result.length === 1) {
                    result[0].id = result[0]._id.toString();
                    resolve(result[0]);
                } else {
                    this._log.warn("The query returned more than one result.");
                    reject('The system returned more than one record.');
                }
            });
        });
    }

    public static findAllByAttribute(model: Model<any>, attributeName: string, value: any): Promise<any> {
        this._log.debug("Call to findAllByAttribute with attributeName: %j , value: %j", attributeName, value);
        const query = {};
        query[attributeName] = value;
        return this.findAllByQuery(model, query);
    }

    /**
     * Query data from a mongodb model
     * @param model The model to look for
     * @param query The query to perform, it must be a valid mongoose query
     * @return {Promise} a promise with the result
     */
    public static  findAllByQuery(model: Model<any>, query: any): Promise<any> {
        this._log.debug("call to findAllByQuery with query: %j", query);
        return new Promise((resolve, reject) => {
            model.find(query).lean().exec((err, result: any[]) => {
                if (err) throw err;
                resolve(result);
            });
        });
    }

    /**
     * Find all records whose attribute vales matches with any value of the list.
     * @param model The model to looks for
     * @param attributeName The attribute
     * @param values The values to match
     * @return {Promise<any>} The records that matches with the query
     */
    public static findAllByAttributeNameIn(model: Model<any>, attributeName: string, values: any[]): Promise<any> {
        this._log.debug("Call to findAllByAttributeNameIn attributeName: %j values: ", attributeName, values);
        const query = {};
        query[attributeName] = {$in: values};
        return this.findAllByQuery(model, query);
    }

    public static deleteAll(model: Model<any>): Promise<any> {
        this._log.debug("Call to delete all");
        return new Promise((resolve, reject) => {
            model.remove({}, (err) => {
                if (err) throw err;
                resolve();
            });
        });
    }

    public static insert(model: Model<any>, objectToInsert: any): Promise<any> {
        this._log.debug("Call to insert with objectToInsert: %j", objectToInsert);
        return new Promise((resolve, reject) => {
            const newObject = new model(objectToInsert);
            newObject.save((err, result: any) => {
                if (err) throw err;
                objectToInsert.id = result._id.toString();
                resolve(objectToInsert);
            });
        });
    }

    public static insertMany(model: Model<any>, objectsToInsert: any[]): Promise<any> {
        this._log.debug("Call to insertMany with objectsToInsert %j", objectsToInsert);
        return new Promise((resolve, reject) => {
            model.insertMany(objectsToInsert)
                .then((values) => {
                    for (const obj of values) {
                        obj.id = obj._id.toString();
                    }
                    resolve(values);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    public static update(model: Model<any>, objectToUpdate: any): Promise<any> {
        this._log.debug("Call to update with objectToUpdate: %j", objectToUpdate);
        return new Promise((resolve, reject) => {
            const query = {_id: objectToUpdate.id};
            const values = {$set: objectToUpdate};
            model.findOneAndUpdate(query, values).lean().exec((err, result: any) => {
                if (err) throw err;
                result.id = result._id.toString();
                resolve(result);
            });
        });
    }

    public static remove(model: Model<any>, objectToDelete: any): Promise<any> {
        this._log.debug("Call to remove with objectToDelete: %j", objectToDelete);
        return new Promise((resolve, reject) => {
            const query = {_id: objectToDelete.id};
            model.remove(query).lean().exec((err, result) => {
                if (err) throw err;
                resolve(result);
            });
        });
    }

    private static _log = logger.getLogger('MongoDbUtil');
}
