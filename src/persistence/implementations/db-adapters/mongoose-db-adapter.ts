/*
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as logger from 'log4js';
import Promise = require("bluebird");
import {Model} from "mongoose";
import * as mongoose from "mongoose";
import {DbAdapter} from "../../api/dn-adapters/db-adapter";
import {AttributeFilter} from "../dao/attribute-filter";

/**
 * this class in an implementation of CrudRepository in order to use mongoose as the db engine.
 */
export class MongooseAdapter implements DbAdapter {
    public model: Model<any>;

    private _log = logger.getLogger("MongooseAdapter");

    constructor(model: Model<any>) {
        this.model = model;
    }

    /**
     * Find one record by the id.
     * @param id The id to look for.
     * @return {Promise<any>} Return the document whose id matches the id. If no record is founded then the method
     * returns null.
     */
    findOneById(id): Promise<any> {
        this._log.debug('Call to findOne with model: %j id: %j ', this.model.modelName, id);
        return new Promise((resolve, reject) => {
            const query = {_id: mongoose.Types.ObjectId(id)};
            this.model.findOne(query).lean().exec((err, result: any) => {
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
     * @param arrayOfIds The ids to look for.
     * @return {Promise<any>} A promise containing the result. If no records are founded, then the method returns
     * an empty array.
     */
    findByIds(arrayOfIds: any[]): Promise<any> {
        this._log.debug('Call to findByIds with model: %j, arrayOfIds: %j ', this.model.modelName, arrayOfIds);
        const query = {
            _id: {$in: arrayOfIds}
        };
        return this.findByQuery(query);
    }

    /**
     * Removes a document inside the collection.
     * @param objectToDelete The object to delete. This object must contain an attribute called "id" as string in
     * order to know which document to delete.
     * @return {Promise<any>} a promise indicating the operation was successful.
     */
    remove(objectToDelete: any): Promise<any> {
        this._log.debug("Call to remove with model: %j, objectToDelete: %j", this.model.modelName, objectToDelete);
        return new Promise((resolve, reject) => {
            const query = {_id: objectToDelete.id};
            this.model.remove(query).lean().exec((err, result) => {
                if (err) throw err;
                resolve(result);
            });
        });
    }

    /**
     * Count all documents in the model.
     * @return {Promise<any>} The amount of documents inside the collection.
     */
    count(): Promise<number> {
        this._log.debug("Call to count");
        return new Promise((resolve, reject) => {
            this.model.count({}, (err, count) => {
                if (err) throw err;
                this._log.debug("Result: %j", count);
                resolve(count);
            });
        });
    }

    /**
     * Delete all documents inside the model.
     * @return {Promise<any>} Returns a promise indicating the delete was successful.
     */
    removeAll(): Promise<any> {
        this._log.debug("Call to removeAll all with model: %j", this.model.modelName);
        return new Promise((resolve, reject) => {
            this.model.remove({}, (err) => {
                if (err) throw err;
                resolve();
            });
        });
    }

    /**
     * Delete all documents inside the model whose ids matches the list.
     * @param ids A list of ids.
     * @return {Promise} Returns a promise indicating the delete was successful.
     */
    removeAllByIds(ids: any[]): Promise<any> {
        this._log.debug("Call to removeByIds with model: %j, ids: %j", this.model.modelName, ids);
        return new Promise((resolve, reject) => {
            const query = {
                _id: {$in: ids}
            };
            this.model.remove(query).lean().exec((err, result) => {
                if (err) throw err;
                resolve(result);
            });
        });
    }

    /**
     * Find one document inside the model that has the attributeName and the value.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Promise<any>} Return the document that matches the criteria. Returns a reject if there are more than
     * one document that matches the criteria.
     */
    findOneByAttribute(attributeName: string, value): Promise<any> {
        this._log.debug("Call to findOneByAttribute with model: %j, attributeName: %j , value: %j", this.model.modelName, attributeName, value);
        return new Promise((resolve, reject) => {
            const query = {};
            query[attributeName] = value;
            this.model.find(query).lean().exec((err, result: any[]) => {
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
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Promise<any>} Return a list of documents that matches the criteria. If no records are founded, then the method
     * returns an empty array.
     */
    findByAttribute(attributeName: string, value): Promise<any[]> {
        this._log.debug("Call to findByAttribute with model: %j, attributeName: %j , value: %j", this.model.modelName, attributeName, value);
        const query = {};
        query[attributeName] = value;
        return this.findByQuery(query);
    }

    /**
     * Find all records whose attribute vales matches with any value of the list.
     * @param attributeName The attribute to look for.
     * @param values The values to match.
     * @return {Promise<any>} The records that matches with the query
     */
    findByAttributeNameIn(attributeName: string, values: any[]): Promise<any> {
        this._log.debug("Call to findByAttributeNameIn model: %j, attributeName: %j values: ", this.model.modelName, attributeName, values);
        const query = {};
        query[attributeName] = {$in: values};
        return this.findByQuery(query);
    }

    /**
     * Insert a document inside the collection.
     * @param objectToInsert The data to insert.
     * @return {Promise<any>} The inserted object. The object contains the id generated by mongodb in a
     * attribute called "id" as string.
     */
    insert(objectToInsert: any): Promise<any> {
        this._log.debug("Call to insert with objectToInsert: %j", objectToInsert);
        this._log.debug("Call to insert with model: %j, objectToInsert: %j", this.model.modelName, objectToInsert);
        return new Promise((resolve, reject) => {
            const newObject = new this.model(objectToInsert);
            newObject.save((err, result: any) => {
                if (err) throw err;
                result = this.cleanObjectIds(result._doc);
                this._log.debug("Returning result after insert %j", result);
                resolve(result);
            });
        });
    }

    /**
     * Update the document info inside the collection.
     * @param objectToUpdate The data to update. This object must have an attribute called "id" as string in order
     * to know which document is going to be updated.
     * @return {Promise<any>} A promise containing the updated object.
     */
    update(objectToUpdate: any): Promise<any> {
        this._log.debug("Call to update with model %j objectToUpdate: %j", this.model.modelName, objectToUpdate);
        return new Promise((resolve, reject) => {
            const query = {_id: objectToUpdate.id};
            const values = {$set: objectToUpdate};
            const options = {};
            const newAttribute = "new";
            options[newAttribute] = true;
            this.model.findOneAndUpdate(query, values, options).lean().exec((err, result: any) => {
                if (err) throw err;
                result = this.cleanObjectIds(result);
                this._log.debug("Returning result after update %j", result);
                resolve(result);
            });
        });
    }

    /**
     * Insert many documents at once inside the collection.
     * @param objectsToInsert The objects to insert.
     * @return {Promise<any>} Returns a promise containing the inserted objects. Each inserted object
     * contains the generated id of mongodb inside a attribute called "id" as string.
     */
    insertMany(objectsToInsert: any[]): Promise<any> {
        this._log.debug("Call to insertMany with model: %j, objectsToInsert %j", this.model.modelName, objectsToInsert);
        return new Promise((resolve, reject) => {
            this.model.insertMany(objectsToInsert, (err, values) => {
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
     * Return all objects
     * @return {Promise<any>} A promise containing all objects.
     */
    findAll(): Promise<any[]> {
        this._log.debug("Call to findAll");
        return this.findByQuery({});
    }

    /**
     * Find all the documents that matches all attributes.
     * @param attributes The attributes-value filters.
     * @return {Promise<any>} The objects that matches the criteria.
     */
    public findByAttributesAndOperator(attributes: AttributeFilter[]): Promise<any[]> {
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
     * @return {Promise<any>} The objects that matches the criteria.
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
     * Find all documents that matches with the query criteria. The query is a mongo-like query object.
     * @param query The query criteria.
     * @return {Promise<any>} The objects that matches the query criteria. If no records are founded, then the method
     * returns an empty array.
     */
    public findByQuery(query: any): Promise<any[]> {
        this._log.debug("call to findByQuery with model: %j, query: %j", this.model.modelName, query);
        return new Promise((resolve, reject) => {
            this.model.find(query).lean().exec((err, result: any[]) => {
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
     * Remove a document whose id matches with the id parameter.
     * @param id The id query criteria.
     * @return {Promise<any>} Returns a promise indicating the delete was successful.
     */
    public removeById(id: any): Promise<any> {
        this._log.debug("Call to removeById by id: %j and model: %j", id, this.model.modelName);
        return new Promise((resolve, reject) => {
            const query = {_id: id};
            this.model.remove(query).lean().exec((err, result) => {
                if (err) throw err;
                resolve(result);
            });
        });
    }

    /**
     * Clean the object that are going to be returned to the daos.
     * @param object The object to ble cleaned.
     * @return {any} the object cleaned.
     */
    private cleanObjectIds(object: any) {
        object.id = object._id.toString();
        Object.keys(object).forEach((key, index) => {
            if (key !== "_id" && object[key] instanceof mongoose.Types.ObjectId) {
                object[key] = object[key].toString();
            }
        });
        return object;
    }
}
