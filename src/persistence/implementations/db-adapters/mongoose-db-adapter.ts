/*
/*
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import Promise = require("bluebird");
import { Model } from "mongoose";
import { DbAdapter } from "persistence/api/db-adapters/db-adapter";
import * as logger from "utils/logger-api/logger-api";
import { AttributeFilter } from "../dao/attribute-filter";

/**
 * this class in an implementation of DbAdapter in order to use mongoose as the db engine.
 */
export class MongooseAdapter implements DbAdapter {
	public model: Model<any>;
	public adapterProperties: any = {};

	private _log = logger.getLogger("MongooseAdapter");

	constructor(model: Model<any>) {
		this.model = model;
		this.adapterProperties.model = model;
		// this.adapterProperties.cleanObjectIds = this.cleanObjectIds;
	}

	/**
	 * Find one record by the id.
	 * @param id The id to look for.
	 * @return {Promise<any>} Return the document whose id matches the id. If no record is founded then the method
	 * returns null.
	 */
	findOneMethod(id): Promise<any> {
		this._log.debug("Call to findOneMethod with model: %j id: %j ", this.adapterProperties.model.modelName, id);
		return new Promise((resolve, reject) => {
			const query = { id };
			this.adapterProperties.model
				.findOne(query, { _id: 0 })
				.lean()
				.exec((err, result: any) => {
					if (err) {
						this._log.error("failed to findOneMethod with model %j id %j: %j", this.adapterProperties.model.modelName, id, {
							message: err && err.message,
							stack: err && err.stack
						});
						reject(err);
						return;
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
	findByIdsMethod(arrayOfIds: any[]): Promise<any> {
		this._log.debug(
			"Call to findByIdsMethod with model: %j, arrayOfIds: %j ",
			this.adapterProperties.model.modelName,
			arrayOfIds
		);
		const query = {
			id: { $in: arrayOfIds }
		};
		return this.findByQueryMethod(query);
	}

	/**
	 * Removes a document inside the collection.
	 * @param objectToDelete The object to delete. This object must contain an attribute called "id" as string in
	 * order to know which document to delete.
	 * @return {Promise<any>} a promise indicating the operation was successful.
	 */
	remove(objectToDelete: any): Promise<any> {
		this._log.debug(
			"Call to remove with model: %j, objectToDelete: %j",
			this.adapterProperties.model.modelName,
			objectToDelete
		);
		return new Promise((resolve, reject) => {
			const query = { id: objectToDelete.id };
			this.adapterProperties.model
				.remove(query)
				.lean()
				.exec((err, result) => {
					if (err) {
						this._log.error("failed to remove %j from model %j: %j", objectToDelete, this.adapterProperties.model.modelName, {
							message: err && err.message,
							stack: err && err.stack
						});
						reject(err);
						return;
					}
					resolve(result);
				});
		});
	}

	/**
	 * Counts the amount of documents in a collection.
	 * @return {Promise<number>} Returns the amount of documents.
	 */
	count(): Promise<number> {
		this._log.debug("Call to count with model: %j", this.adapterProperties.model.modelName);
		return new Promise<number>((resolve, reject) => {
			this.adapterProperties.model.count({}, (err, count) => {
				if (err) {
					this._log.error("failed to count model %j: %j", this.adapterProperties.model.modelName, {
						message: err && err.message,
						stack: err && err.stack
					});
					reject(err);
					return;
				}
				this._log.debug("count of model %j -> %j", this.adapterProperties.model.modelName, count);
				resolve(count);
			});
		});
	}

	/**
	 * Count all documents given then query.
	 * @param query
	 */
	countByQuery(query: any): Promise<number> {
		this._log.debug("Call to countByQuery with model: %j, query: %j", this.adapterProperties.model.modelName, query);
		return new Promise<number>((resolve, reject) => {
			this.adapterProperties.model.count(query, (err, count) => {
				if (err) {
					this._log.error("failed to countByQuery %j on model %j: %j", query, this.adapterProperties.model.modelName, {
						message: err && err.message,
						stack: err && err.stack
					});
					reject(err);
					return;
				}
				this._log.debug("countByQuery %j on model %j -> %j", query, this.adapterProperties.model.modelName, count);
				resolve(count);
			});
		});
	}

	/**
	 * Delete all documents inside the model.
	 * @return {Promise<any>} Returns a promise indicating the delete was successful.
	 */
	removeAll(): Promise<any> {
		this._log.debug("Call to removeAll all with model: %j", this.adapterProperties.model.modelName);
		return new Promise((resolve, reject) => {
			this.adapterProperties.model.remove({}, err => {
				if (err) {
					this._log.error("failed to removeAll from model %j: %j", this.adapterProperties.model.modelName, {
						message: err && err.message,
						stack: err && err.stack
					});
					reject(err);
					return;
				}
				resolve();
			});
		});
	}

	/**
	 * Delete all documents inside the model whose ids matches the list.
	 * @param ids A list of ids.
	 * @return {Promise} Returns a promise indicating the delete was successful.
	 */
	removeByIds(ids: any[]): Promise<any> {
		this._log.debug("Call to removeByIds with model: %j, ids: %j", this.adapterProperties.model.modelName, ids);
		return new Promise((resolve, reject) => {
			const query = {
				id: { $in: ids }
			};
			this.adapterProperties.model
				.remove(query)
				.lean()
				.exec((err, result) => {
					if (err) {
						this._log.error("failed to removeByIds %j from model %j: %j", ids, this.adapterProperties.model.modelName, {
							message: err && err.message,
							stack: err && err.stack
						});
						reject(err);
						return;
					}
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
	findOneByAttributeMethod(attributeName: string, value): Promise<any> {
		this._log.debug(
			"Call to findOneByAttributeMethod with model: %j, attributeName: %j , value: %j",
			this.adapterProperties.model.modelName,
			attributeName,
			value
		);
		return new Promise((resolve, reject) => {
			const query = {};
			query[attributeName] = value;
			this.adapterProperties.model
				.find(query, { _id: 0 })
				.lean()
				.exec((err, result: any[]) => {
					if (err) {
						this._log.error(
							"failed to findOneByAttributeMethod %j = %j on model %j: %j",
							attributeName,
							value,
							this.adapterProperties.model.modelName,
							{ message: err && err.message, stack: err && err.stack }
						);
						reject(err);
						return;
					}
					if (result.length === 0) {
						resolve(null);
					} else if (result.length === 1) {
						// this.adapterProperties.cleanObjectIds(result[0]);
						resolve(result[0]);
					} else {
						this._log.warn(
							"findOneByAttributeMethod %j = %j on model %j returned more than one result",
							attributeName,
							value,
							this.adapterProperties.model.modelName
						);
						reject("The system returned more than one record.");
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
	findByAttributeMethod(attributeName: string, value): Promise<any[]> {
		this._log.debug(
			"Call to findByAttributeMethod with model: %j, attributeName: %j , value: %j",
			this.adapterProperties.model.modelName,
			attributeName,
			value
		);
		const query = {};
		query[attributeName] = value;
		return this.findByQueryMethod(query);
	}

	/**
	 * Find all records whose attribute vales matches with any value of the list.
	 * @param attributeName The attribute to look for.
	 * @param values The values to match.
	 * @return {Promise<any>} The records that matches with the query
	 */
	findByAttributeNameInMethod(attributeName: string, values: any[]): Promise<any> {
		this._log.debug(
			"Call to findByAttributeNameInMethod model: %j, attributeName: %j values: ",
			this.adapterProperties.model.modelName,
			attributeName,
			values
		);
		const query = {};
		query[attributeName] = { $in: values };
		return this.findByQueryMethod(query);
	}

	/**
	 * Insert a document inside the collection.
	 * @param objectToInsert The data to insertMethod.
	 * @return {Promise<any>} The inserted object. The object contains the id generated by mongodb in a
	 * attribute called "id" as string.
	 */
	insertMethod(objectToInsert: any): Promise<any> {
		this._log.debug(
			"Call to insertMethod with model: %j, objectToInsert: %j",
			this.adapterProperties.model.modelName,
			objectToInsert
		);
		return new Promise((resolve, reject) => {
			const newObject = new this.adapterProperties.model(objectToInsert);
			newObject.save((err, result: any) => {
				if (err) {
					this._log.error("failed to insertMethod %j on model %j: %j", objectToInsert, this.adapterProperties.model.modelName, {
						message: err && err.message,
						stack: err && err.stack
					});
					reject(err);
					return;
				}
				// result = this.adapterProperties.cleanObjectIds(result._doc);
				this._log.debug("insertMethod on model %j -> %j", this.adapterProperties.model.modelName, objectToInsert);
				resolve(objectToInsert);
			});
		});
	}

	/**
	 * Update the document info inside the collection.
	 * This type of updated is done via $set. This means if there are attributes not defined in the object to update, then the method
	 * does not remove the missing attributes.
	 * @param objectToUpdate The data to updateMethod. This object must have an attribute called "id" as string in order
	 * to know which document is going to be updated.
	 * @return {Promise<any>} A promise containing the updated object.
	 */
	updateMethod(objectToUpdate: any): Promise<any> {
		this._log.debug(
			"Call to updateMethod with model %j objectToUpdate: %j",
			this.adapterProperties.model.modelName,
			objectToUpdate
		);
		return new Promise((resolve, reject) => {
			const query = { id: objectToUpdate.id };
			const values = { $set: objectToUpdate };
			const options = {};
			const newAttribute = "new";
			options[newAttribute] = true;
			this.adapterProperties.model
				.findOneAndUpdate(query, values, options)
				.lean()
				.exec((err, result: any) => {
					if (err) {
						this._log.error("failed to updateMethod %j on model %j: %j", objectToUpdate, this.adapterProperties.model.modelName, {
							message: err && err.message,
							stack: err && err.stack
						});
						reject(err);
						return;
					}
					// result = this.adapterProperties.cleanObjectIds(result);
					this._log.debug("updateMethod on model %j -> %j", this.adapterProperties.model.modelName, objectToUpdate);
					resolve(objectToUpdate);
				});
		});
	}

	/**
	 * Insert many documents at once inside the collection.
	 * @param objectsToInsert The objects to insertMethod.
	 * @return {Promise<any>} Returns a promise containing the inserted objects. Each inserted object
	 * contains the generated id of mongodb inside a attribute called "id" as string.
	 */
	insertManyMethod(objectsToInsert: any[]): Promise<any> {
		this._log.debug(
			"Call to insertManyMethod with model: %j, objectsToInsert %j",
			this.adapterProperties.model.modelName,
			objectsToInsert
		);
		return new Promise((resolve, reject) => {
			this.adapterProperties.model.insertMany(objectsToInsert, (err, values) => {
				if (err) {
					this._log.error(
						"failed to insertManyMethod %j records on model %j: %j",
						objectsToInsert.length,
						this.adapterProperties.model.modelName,
						{ message: err && err.message, stack: err && err.stack }
					);
					reject(err);
					return;
				}
				this._log.debug(
					"insertManyMethod on model %j -> %j records",
					this.adapterProperties.model.modelName,
					objectsToInsert.length
				);
				resolve(objectsToInsert);
			});
		});
	}

	updateManyMethod(objectsToUpdate: any[]): Promise<any[]> {
		this._log.debug(
			"Call to updateManyMethod with model: %j, objectsToUpdate %j",
			this.adapterProperties.model.modelName,
			objectsToUpdate
		);
		return new Promise((resolve, reject) => {
			this.adapterProperties.model
				.bulkWrite(
					objectsToUpdate.map(objectToUpdate => {
						return {
							updateOne: {
								filter: { id: objectToUpdate.id },
								// According to mongoose, the $set is defined by mongoose.
								update: objectToUpdate
							}
						};
					})
				)
				.then(() => {
					this._log.debug(
						"updateManyMethod on model %j -> %j records",
						this.adapterProperties.model.modelName,
						objectsToUpdate.length
					);
					resolve(objectsToUpdate);
				})
				.catch((err: any) => {
					this._log.error(
						"failed to updateManyMethod %j records on model %j: %j",
						objectsToUpdate.length,
						this.adapterProperties.model.modelName,
						{ message: err && err.message, stack: err && err.stack }
					);
					reject(err);
				});
		});
	}

	/**
	 * Return all objects
	 * @return {Promise<any>} A promise containing all objects.
	 */
	findAllMethod(): Promise<any[]> {
		this._log.debug("Call to findAllMethod");
		return this.findByQueryMethod({});
	}

	/**
	 * Find all the documents that matches all attributes.
	 * @param attributes The attributes-value filters.
	 * @return {Promise<any>} The objects that matches the criteria.
	 */
	public findByAttributesAndOperatorMethod(attributes: AttributeFilter[]): Promise<any[]> {
		this._log.debug("Call to findByAttributesAndOperatorMethod with attributes: %j", attributes);
		const query = {
			$and: []
		};
		for (const attribute of attributes) {
			const condition = {};
			condition[attribute.attributeName] = { $eq: attribute.value };
			query.$and.push(condition);
		}
		return this.findByQueryMethod(query);
	}

	/**
	 * Find all the documents that matches only one of the attributes.
	 * @param attributes The attributes-value filters.
	 * @return {Promise<any>} The objects that matches the criteria.
	 */
	public findByAttributesOrOperatorMethod(attributes: AttributeFilter[]): Promise<any[]> {
		this._log.debug("Call to findByAttributesOrOperatorMethod with attributes: %j", attributes);
		const query = {
			$or: []
		};
		for (const attribute of attributes) {
			const condition = {};
			condition[attribute.attributeName] = { $eq: attribute.value };
			query.$or.push(condition);
		}
		return this.findByQueryMethod(query);
	}

	/**
	 * Find all documents that matches with the query criteria. The query is a mongo-like query object.
	 * @param query The query criteria.
	 * @return {Promise} The objects that matches the query criteria. If no records are founded, then the method
	 * returns an empty array.
	 */
	public findByQueryMethod(query: any): Promise<any[]> {
		this._log.debug(
			"call to findByQueryMethod with model: %j, query: %j",
			this.adapterProperties.model.modelName,
			query
		);
		return new Promise<any>((resolve, reject) => {
			this.adapterProperties.model
				.find(query, { _id: 0 })
				.lean()
				.exec((err, result: any[]) => {
					if (err) {
						this._log.error("failed to findByQueryMethod %j on model %j: %j", query, this.adapterProperties.model.modelName, {
							message: err && err.message,
							stack: err && err.stack
						});
						reject(err);
						return;
					}
					this._log.debug("findByQueryMethod %j on model %j -> %j records", query, this.adapterProperties.model.modelName, result.length);
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
		this._log.debug("Call to removeById by id: %j and model: %j", id, this.adapterProperties.model.modelName);
		return new Promise((resolve, reject) => {
			const query = { id };
			this.adapterProperties.model
				.remove(query)
				.lean()
				.exec((err, result) => {
					if (err) {
						this._log.error("failed to removeById %j from model %j: %j", id, this.adapterProperties.model.modelName, {
							message: err && err.message,
							stack: err && err.stack
						});
						reject(err);
						return;
					}
					resolve(result);
				});
		});
	}
}
