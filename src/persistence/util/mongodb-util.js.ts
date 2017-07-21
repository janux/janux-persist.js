/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */

import * as logger from 'log4js';
import mongoose = require('mongoose');
import {Model} from 'mongoose';
import Promise = require('bluebird');

/**
 * Mongoose  db methods util.
 * Almost all the method has the following responsibilities.
 * Because mongodb stores an unique id called _id per each document and the attribute is a object, most of the methods
 * inside this class retrieve the _id attribute and store it inside the "id" attribute as string.
 */
export class MongoDbUtil {

    /**
     * Find one record by the id.
     * @param model The mongoose model to look inside.
     * @param id The id to look for.
     * @return {Promise<any>} Return the document whose id matches the id. If no record is founded then the method
     * returns null.
     */
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

    /**
     * Find all the documents inside a model whose ids belongs to the list.
     * @param model The mongoose model to look inside.
     * @param arrayOfIds The ids to look for.
     * @return {Promise<any>} A promise containing the result. If no records are founded, then the method returns
     * an empty array.
     */
    public static findAllByIds(model: Model<any>, arrayOfIds: any[]): Promise<any> {
        this._log.debug('Call to findAllByIds with model: %j, arrayOfIds: %j ', model.modelName, arrayOfIds);
        const query = {
            _id: {$in: arrayOfIds}
        };
        return this.findAllByQuery(model, query);
    }

    /**
     * Count all documents in the model.
     * @param model The model to count.
     * @return {Promise<any>} The amount of documents inside the collection.
     */
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

    /**
     * Find one document inside the model that has the attributeName and the value.
     * @param model The mongoose model to look inside.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Promise<any>} Return the document that matches the criteria. Returns a reject if there are more than
     * one document that matches the criteria.
     */
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

    /**
     * Find all the documents inside the model that has the attributeName and the value.
     * @param model The mongoose model to look inside.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Promise<any>} Return a list of documents that matches the criteria. If no records are founded, then the method
     * returns an empty array.
     */
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
     * @param attributeName The attribute to look for.
     * @param values The values to match.
     * @return {Promise<any>} The records that matches with the query
     */
    public static findAllByAttributeNameIn(model: Model<any>, attributeName: string, values: any[]): Promise<any> {
        this._log.debug("Call to findAllByAttributeNameIn model: %j, attributeName: %j values: ", model.modelName, attributeName, values);
        const query = {};
        query[attributeName] = {$in: values};
        return this.findAllByQuery(model, query);
    }

    /**
     * Delete all documents inside the model.
     * @param model The model.
     * @return {Promise} Returns a promise indicating the delete was successful.
     */
    public static deleteAll(model: Model<any>): Promise<any> {
        this._log.debug("Call to delete all with model: %j", model.modelName);
        return new Promise((resolve, reject) => {
            model.remove({}, (err) => {
                if (err) throw err;
                resolve();
            });
        });
    }

    /**
     * Delete all documents inside the model whose ids matches the list.
     * @param model The mongoose model whose documents are going to be deleted.
     * @param ids A list of ids.
     * @return {Promise} Returns a promise indicating the delete was successful.
     */
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

    /**
     * Insert a document inside the collection.
     * @param model The mongoose model where to insert the document.
     * @param objectToInsert The data to insert.
     * @return {Promise<any>} The inserted object. The object contains the id generated by mongodb in a
     * attribute called "id" as string.
     */
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

    /**
     * Insert many documents at once inside the collection.
     * @param model The mongoose model where the data is going to be inserted.
     * @param objectsToInsert The objects to insert.
     * @return {Promise<any>} Returns a promise containing the inserted objects. Each inserted object
     * contains the generated id of mongodb inside a attribute called "id" as string.
     */
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

    /**
     * Update the document info inside the collection.
     * @param model The mongoose model where the document resides.
     * @param objectToUpdate The data to update. This object must have an attribute called "id" as string in order
     * to know which document is going to be updated.
     * @return {Promise<any>} A promise containing the updated object.
     */
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

    /**
     * Removes a document inside the collection.
     * @param model The model that has the document to be deleted.
     * @param objectToDelete The object to delete. This object must contain an attribute called "id" as string in
     * order to know which document to delete.
     * @return {Promise} a promise indicating the operation was successful.
     */
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

    /**
     * Remove a document whose id matches with the id parameter.
     * @param model The mongoose model that has the document to be deleted.
     * @param id The id query criteria.
     * @return {Promise} Returns a promise indicating the delete was successful.
     */
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

    /**
     * Clean the object that are going to be returned to the daos.
     * @param object The object to ble cleaned.
     * @return {any} the object cleaned.
     */
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
