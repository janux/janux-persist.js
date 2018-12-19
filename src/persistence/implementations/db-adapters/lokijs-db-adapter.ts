/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import Promise = require("bluebird");
import * as _ from "lodash";
import { DbAdapter } from "persistence/api/db-adapters/db-adapter";
import { AttributeFilter } from "persistence/implementations/dao/attribute-filter";
import * as logger from "utils/logger-api/logger-api";

/**
 * Generic implementation of lokijs db functions
 * When calling this method. Make sure params has the
 * correct db property and the correct collection property
 */
export class LokiJsAdapter implements DbAdapter {
	public adapterProperties: any = {};
	public db: any;
	public collectionName;
	private _log = logger.getLogger("LokiJsAdapter");

	constructor(collectionName: string, db: any) {
		this._log.debug("Call to constructor with collectionName %j", collectionName);
		this.collectionName = collectionName;
		this.db = db;
		this.adapterProperties.db = db;
		this.adapterProperties.collectionName = collectionName;
		this.adapterProperties.findCollection = this.findCollection;
		this.adapterProperties.cleanArray = this.cleanArray;
	}

	/**
	 * Find one record by the pid.
	 * @param id The id to look for.
	 * @return {Promise<any>} Return the document whose id matches the id. If no record is founded then the method
	 * returns null.
	 */
	public findOneMethod(id: any): Promise<any> {
		this._log.debug(
			"Call to findOneMethod with id: %j and collection %j",
			id,
			this.adapterProperties.findCollection().name
		);
		const result = this.adapterProperties.findCollection().findOne({ id });
		// if (_.isNil(result) === false) {
		// result.id = result.$loki.toString();
		// }
		this._log.debug("Result id %j", result);
		return Promise.resolve(result);
	}

	/**
	 * Find all the documents inside a model whose ids belongs to the list.
	 * @param arrayOfIds The ids to look for.
	 * @return {Promise<any>} A promise containing the result. If no records are founded, then the method returns
	 * an empty array.
	 */
	public findByIdsMethod(arrayOfIds: any[]): Promise<any> {
		this._log.debug(
			"Call to findByIdsMethod with collection: %j , arrayOfIds: %j",
			this.adapterProperties.findCollection().name,
			arrayOfIds
		);
		return this.findByAttributeNameInMethod("id", arrayOfIds);
	}

	/**
	 * Removes a document inside the collection.
	 * @param objectToDelete The object to delete. This object must contain an attribute called "id" as string in
	 * order to know which document to delete.
	 * @return {Promise<any>} a promise indicating the operation was successful.
	 */
	public remove(objectToDelete: any): Promise<any> {
		this._log.debug(
			"Call to remove with collection: %j, objectToDelete: %j",
			this.adapterProperties.findCollection().name,
			objectToDelete
		);
		return new Promise(resolve => {
			this.adapterProperties.findCollection().findAndRemove({ id: objectToDelete.id });
			this.adapterProperties.db.saveDatabase(() => {
				resolve(objectToDelete);
			});
		});
	}

	/**
	 * Count all documents in the collection.
	 * @return {Promise<any>} The amount of documents inside the collection.
	 */
	public count(): Promise<number> {
		this._log.debug("Call to count with collection: %j", this.adapterProperties.findCollection().name);
		const result = this.adapterProperties.findCollection().count();
		this._log.debug("Result %j", result);
		return Promise.resolve(result);
	}

	/**
	 * Count all documents given then query.
	 * @param query
	 */
	countByQuery(query: any): Promise<number> {
		this._log.debug(
			"Call to countByQuery with collection: %j and query %j",
			this.adapterProperties.findCollection().name,
			query
		);
		const result = this.adapterProperties.findCollection().count(query);
		this._log.debug("Result %j", result);
		return Promise.resolve(result);
	}

	/**
	 * Delete all documents inside the collection.
	 * @return {Promise<any>} Returns a promise indicating the delete was successful.
	 */
	public removeAll(): Promise<any> {
		this._log.debug("Call to removeAll with collection: %j", this.adapterProperties.findCollection().name);
		return new Promise(resolve => {
			this.adapterProperties.findCollection().clear();
			this.adapterProperties.db.saveDatabase(() => {
				resolve();
			});
		});
	}

	/**
	 * Delete all documents inside the collections whose ids matches the list.
	 * @param ids A list of ids.
	 * @return {Promise<any>} Returns a promise indicating the delete was successful.
	 */
	removeByIds(ids: any[]): Promise<any> {
		this._log.debug(
			"Call to removeByIds with collection %j, ids: %j",
			this.adapterProperties.findCollection().name,
			ids
		);
		return new Promise(resolve => {
			const query = {
				id: { $in: ids }
			};
			this.adapterProperties.findCollection().findAndRemove(query);
			this.adapterProperties.db.saveDatabase(() => {
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
	public findOneByAttributeMethod(attributeName: string, value): Promise<any> {
		this._log.debug(
			"Call to findOneByAttributeMethod with collection: %j, attributeName: %j, value: %j",
			this.adapterProperties.findCollection().name,
			attributeName,
			value
		);
		const query = {};
		let result: any;
		query[attributeName] = { $eq: value };
		const resultQuery = this.adapterProperties.findCollection().find(query);
		this._log.debug("Result %j", resultQuery);
		if (resultQuery.length === 0) {
			this._log.debug("Returning null");
			return Promise.resolve(null);
		} else if (resultQuery.length === 1) {
			result = _.clone(resultQuery[0]);
			this._log.debug("Returning %j", result);
			return Promise.resolve(result);
		} else {
			this._log.warn("The query returned more than one result");
			return Promise.reject("The system returned more than one record");
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
	public findByAttributeMethod(attributeName: string, value): Promise<any[]> {
		this._log.debug(
			"Call to findByAttributeMethod with attributeName: %j, value: %j, collection %j",
			attributeName,
			value,
			this.adapterProperties.findCollection().name
		);
		const query = {};
		query[attributeName] = value;
		let result = this.adapterProperties.findCollection().find(query);
		result = _.clone(result);
		this._log.debug("Result %j", result);
		return Promise.resolve(result);
	}

	/**
	 * Find all the documents inside the collection that has the attribute defined in the method and whose values
	 * belongs to the list.
	 * @param attributeName The attribute to look for.
	 * @param values The values to compare.
	 * @return {Promise<any>}
	 */
	public findByAttributeNameInMethod(attributeName: string, values: any[]): Promise<any> {
		this._log.debug(
			"Call to findByAttributeNameInMethod with collection: %j, attributeName: %j, values: %j",
			this.adapterProperties.findCollection().name,
			attributeName,
			values
		);
		const query = {};
		query[attributeName] = { $in: values };
		let result = this.adapterProperties.findCollection().find(query);
		result = _.clone(result);
		this.adapterProperties.cleanArray(result);
		this._log.debug("Result %j", result);
		return Promise.resolve(result);
	}

	/**
	 * Insert a document inside a collection.
	 * @param objectToInsert The object to insertMethod.
	 * @return {Promise<any>} The inserted object. The object contains the id generated by lokijs in a
	 * attribute called "id" as string.
	 */
	public insertMethod(objectToInsert: any): Promise<any> {
		this._log.debug(
			"Call to insertMethod with collection: %j, objectToInsert: %j",
			this.adapterProperties.findCollection().name,
			objectToInsert
		);
		return new Promise(resolve => {
			const result = this.adapterProperties.findCollection().insert(objectToInsert);
			this._log.debug("Result before insertMethod %j", result);
			this.adapterProperties.db.saveDatabase(() => {
				// Get the id generated by lokijs and store it as string.
				objectToInsert.meta = undefined;
				// Yep, we need to clone it. Because the inserted record is a direct reference to the db data.
				objectToInsert = _.cloneDeep(objectToInsert);
				this._log.debug("returning after insertMethod: %j", objectToInsert);
				resolve(objectToInsert);
			});
		});
	}

	/**
	 * Update the document info inside the collection.
	 * @param objectToUpdate The data to updateMethod. This object must have an attribute called "id" as string in order
	 * to know which document is going to be updated.
	 * @return {Promise<any>} A promise containing the updated object.
	 */
	public updateMethod(objectToUpdate: any): Promise<any> {
		this._log.debug(
			"Call to updateMethod with collection: %j, objectToUpdate: %j",
			this.adapterProperties.findCollection().name,
			objectToUpdate
		);
		return new Promise(resolve => {
			this.adapterProperties.findCollection().updateWhere(
				o => {
					return o.id === objectToUpdate.id;
				},
				u => {
					const meta = u.meta;
					const $loki = u.$loki;
					const keys = Object.keys(objectToUpdate);
					for (const key of keys) {
						u[key] = objectToUpdate[key];
					}
					// u = objectToUpdate;
					u.meta = meta;
					u.$loki = $loki;
					return u;
				}
			);
			this.adapterProperties.db.saveDatabase(() => {
				resolve(objectToUpdate);
			});
		});
	}

	/**
	 * Insert many documents at once inside the collection.
	 * @param objectsToInsert The objects to insertMethod.
	 * @return {Promise<any>} Returns a promise containing the inserted objects. Each inserted object
	 * contains the generated id of lokijs inside a attribute called "id" and the type is string.
	 */
	public insertManyMethod(objectsToInsert: any[]): Promise<any> {
		this._log.debug(
			"Call to insertManyMethod with collection %j, objectsToInsert: %j",
			this.adapterProperties.findCollection().name,
			objectsToInsert
		);
		return new Promise(resolve => {
			let results = this.adapterProperties.findCollection().insert(objectsToInsert);
			if (_.isArray(results) === false) {
				results = [results];
			}
			// Yep, we need to clone it. Because the inserted records are a direct reference to the db data.
			// For some reason if I don't do it. The subsequent queries return horrible results.
			results = _.cloneDeep(results);
			this.adapterProperties.db.saveDatabase(() => {
				resolve(results);
			});
		});
	}

	/**
	 * Find all documents inside the collection.
	 * @return {Promise<any>} Return a promise containing the objects.
	 */
	findAllMethod(): Promise<any[]> {
		this._log.debug("Call to findAllMethod");
		return this.findByQueryMethod({});
	}

	/**
	 * Find all the documents that matches all attributes.
	 * @param attributes The attributes-value filters.
	 * @return {Promise<any>}
	 */
	findByAttributesAndOperatorMethod(attributes: AttributeFilter[]): Promise<any[]> {
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
	 * @return {Promise<any>}
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
	 * Find all documents that matches with the query criteria. The query for the moment is a mongo-like query object.
	 * @param query The query criteria.
	 * @return {Promise<any>} The objects that matches the query criteria. If no records are founded, then the method
	 * returns an empty array.
	 */
	public findByQueryMethod(query: any): Promise<any[]> {
		this._log.debug(
			"Call to findByQueryMethod with collection: %j, query: %j",
			this.adapterProperties.findCollection().name,
			query
		);
		let result = this.adapterProperties.findCollection().find(query);
		result = _.clone(result);
		this._log.debug("Result %j", result);
		return Promise.resolve(result);
	}

	/**
	 * Remove a document whose id matches with the id parameter.
	 * @param id The id query criteria.
	 * @return {Promise} Returns a promise indicating the delete was successful.
	 */
	public removeById(id: any): Promise<any> {
		this._log.debug(
			"Call to removeById with collection: %j, id: %j",
			this.adapterProperties.findCollection().name,
			id
		);
		return new Promise(resolve => {
			const query = {
				id: { $eq: id }
			};
			this.adapterProperties.findCollection().findAndRemove(query);
			this.adapterProperties.db.saveDatabase(() => {
				resolve();
			});
		});
	}

	public findCollection(): any {
		// this._log.debug("Call to findCollection with %j", this.adapterProperties.collectionName);
		let collection = this.db.getCollection(this.collectionName);
		if (_.isNil(collection)) {
			// this._log.debug("No collection founded with name %j, adding a new one", this.adapterProperties.collectionName);
			collection = this.db.addCollection(this.collectionName);
		}
		return collection;
	}

	/**
	 * Removes the meta attribute that adds lokijs.
	 * @param array
	 */
	public cleanArray(array: any[]) {
		for (const obj of array) {
			obj.meta = undefined;
		}
	}
}
