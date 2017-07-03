/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */

import * as logger from 'log4js';
import mongoose = require('mongoose');
import {Model} from 'mongoose';
import Promise = require('bluebird');

/**
 * Mongodb functions util
 */
export class MongoDbUtil {

    public static findOneById(model: Model<any>, id: any): Promise<any> {
        this._log.debug('Call to findOneById with model: %j id: %j ', model.modelName, id);
        return new Promise((resolve, reject) => {
            const query = {_id: mongoose.Types.ObjectId(id)};
            model.findOne(query).lean().exec((err, result: any) => {
                if (err) throw err;
                if (result !== null) {
                    result = this.cleanObjectIds(result);
                }
                resolve(result);
            });
        });
    }

    public static findAllByIds(model: Model<any>, arrayOfIds: any[]): Promise<any> {
        this._log.debug('Call to findAllByIds with model: %j, arrayOfIds: %j ', model.modelName, arrayOfIds);
        const query = {
            _id: {$in: arrayOfIds}
        };
        return this.findAllByQuery(model, query);
    }

    public static count(model: Model<any>): Promise<any> {
        this._log.debug("Call to count");
        return new Promise((resolve, reject) => {
            model.count({}, (err, count) => {
                if (err) throw err;
                this._log.debug("Result: %j", count);
                resolve(count);
            });
        });
    }

    public static findOneByAttribute(model: Model<any>, attributeName: string, value: any): Promise<any> {
        this._log.debug("Call to findOneByAttribute with model: %j, attributeName: %j , value: %j", model.modelName, attributeName, value);
        return new Promise((resolve, reject) => {
            const query = {};
            query[attributeName] = value;
            model.find(query).lean().exec((err, result: any[]) => {
                if (err) throw err;
                if (result.length === 0) {
                    resolve(null);
                } else if (result.length === 1) {
                    this.cleanObjectIds(result[0]);
                    resolve(result[0]);
                } else {
                    this._log.warn("The query returned more than one result.");
                    reject('The system returned more than one record.');
                }
            });
        });
    }

    public static findAllByAttribute(model: Model<any>, attributeName: string, value: any): Promise<any> {
        this._log.debug("Call to findAllByAttribute with model: %j, attributeName: %j , value: %j", model.modelName, attributeName, value);
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
        this._log.debug("call to findAllByQuery with model: %j, query: %j", model.modelName, query);
        return new Promise((resolve, reject) => {
            model.find(query).lean().exec((err, result: any[]) => {
                if (err) throw err;
                for (const element of result) {
                    this.cleanObjectIds(element);
                }
                this._log.debug("Returning %j records", result.length);
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
        this._log.debug("Call to findAllByAttributeNameIn model: %j, attributeName: %j values: ", model.modelName, attributeName, values);
        const query = {};
        query[attributeName] = {$in: values};
        return this.findAllByQuery(model, query);
    }

    public static deleteAll(model: Model<any>): Promise<any> {
        this._log.debug("Call to delete all with model: %j", model.modelName);
        return new Promise((resolve, reject) => {
            model.remove({}, (err) => {
                if (err) throw err;
                resolve();
            });
        });
    }

    public static deleteAllByIds(model: Model<any>, ids: string[]) {
        this._log.debug("Call to deleteAllByIds with model: %j, ids: %j", model.modelName, ids);
        return new Promise((resolve, reject) => {
            const query = {
                _id: {$in: ids}
            };
            model.remove(query).lean().exec((err, result) => {
                if (err) throw err;
                resolve(result);
            });
        });
    }

    public static insert(model: Model<any>, objectToInsert: any): Promise<any> {
        this._log.debug("Call to insert with model: %j, objectToInsert: %j", model.modelName, objectToInsert);
        return new Promise((resolve, reject) => {
            const newObject = new model(objectToInsert);
            newObject.save((err, result: any) => {
                if (err) throw err;
                result = this.cleanObjectIds(result._doc);
                this._log.debug("Returning result after insert %j", result);
                resolve(result);
            });
        });
    }

    public static insertMany(model: Model<any>, objectsToInsert: any[]): Promise<any> {
        this._log.debug("Call to insertMany with model: %j, objectsToInsert %j", model.modelName, objectsToInsert);
        return new Promise((resolve, reject) => {
            model.insertMany(objectsToInsert, (err, values) => {
                const result = [];
                for (const obj of values) {
                    let element = obj._doc;
                    element = this.cleanObjectIds(element);
                    result.push(element);
                }
                resolve(result);
            });
        });
    }

    public static update(model: Model<any>, objectToUpdate: any): Promise<any> {
        this._log.debug("Call to update with model %j objectToUpdate: %j", model.modelName, objectToUpdate);
        return new Promise((resolve, reject) => {
            const query = {_id: objectToUpdate.id};
            const values = {$set: objectToUpdate};
            const options = {};
            const newAttribute = "new";
            options[newAttribute] = true;
            model.findOneAndUpdate(query, values, options).lean().exec((err, result: any) => {
                if (err) throw err;
                result = this.cleanObjectIds(result);
                this._log.debug("Returning result after update %j", result);
                resolve(result);
            });
        });
    }

    public static remove(model: Model<any>, objectToDelete: any): Promise<any> {
        this._log.debug("Call to remove with model: %j, objectToDelete: %j", model.modelName, objectToDelete);
        return new Promise((resolve, reject) => {
            const query = {_id: objectToDelete.id};
            model.remove(query).lean().exec((err, result) => {
                if (err) throw err;
                resolve(result);
            });
        });
    }

    public static removeById(model: Model<any>, id: string): Promise<any> {
        this._log.debug("Call to removeById by id: %j", id);
        return new Promise((resolve, reject) => {
            const query = {_id: id};
            model.remove(query).lean().exec((err, result) => {
                if (err) throw err;
                resolve(result);
            });
        });
    }

    private static _log = logger.getLogger('MongoDbUtil');

    private static cleanObjectIds(object: any) {
        object.id = object._id.toString();
        Object.keys(object).forEach((key, index) => {
            if (key !== "_id" && object[key] instanceof mongoose.Types.ObjectId) {
                object[key] = object[key].toString();
            }
        });
        return object;
    }
}
