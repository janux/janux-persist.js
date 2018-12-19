/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */
import Promise = require("bluebird");
import { AttributeFilter } from "persistence/implementations/dao/attribute-filter";
import { ReadOnlyRepository } from "./read-only-repository";

/**
 * Interface that defines the basic crud methods
 * per dao.
 */
export interface CrudRepository<t, ID> extends ReadOnlyRepository<t, ID> {
	/**
	 * Find one document by id.
	 * @param id The id to look for.
	 */
	findOne(id: ID): Promise<t>;

	/**
	 * Find all the documents inside a collection whose ids belongs to the list.
	 * @param arrayOfIds The ids to look for.
	 */
	findByIds(arrayOfIds: ID[]): Promise<t[]>;

	/**
	 * Remove a document.
	 * @param objectToDelete The object to delete. This object must contain an attribute called "id" in
	 * order to know which document to delete.
	 */
	remove(objectToDelete: any): Promise<any>;

	/**
	 * Remove a document whose id matches with the id parameter.
	 * @param id The id query criteria.
	 */
	removeById(id: ID): Promise<any>;

	/**
	 * Count all documents in the collection.
	 */
	count(): Promise<number>;

	/**
	 * Count all documents given the query.
	 * @param query
	 */
	countByQuery(query: any): Promise<number>;

	/**
	 * Delete all documents inside the collection.
	 */
	removeAll(): Promise<any>;

	/**
	 * Delete all documents inside the collections whose ids matches the list.
	 * @param ids ids A list of ids.
	 */
	removeByIds(ids: ID[]): Promise<any>;

	/**
	 * Find one document inside the collection that has the attributeName and the value.
	 * @param attributeName The attribute to look for.
	 * @param value The value to compare.
	 */
	findOneByAttribute(attributeName: string, value): Promise<any>;

	/**
	 * Find all the documents inside the collection that has the attributeName and the value.
	 * @param attributeName The attribute to look for.
	 * @param value The value to compare.
	 */
	findByAttribute(attributeName: string, value): Promise<any[]>;

	/**
	 * Find all the documents inside the collection that has the attribute defined in the method and whose values
	 * belongs to the list.
	 * @param attributeName The attribute to look for.
	 * @param values The values to compare.
	 */
	findByAttributeNameIn(attributeName: string, values: any[]): Promise<any>;

	/**
	 * Inserts a document.
	 * @param objectToInsert The object to insertMethod.
	 */
	insert(objectToInsert: any): Promise<any>;

	/**
	 * Update a document.
	 * @param objectToUpdate The data to updateMethod. This object must have an attribute called "id" as string in order
	 * to know which document is going to be updated.
	 */
	update(objectToUpdate: any): Promise<any>;

	/**
	 * Insert many documents at once inside the collection.
	 * @param objectsToInsert The objects to insertMethod.
	 */
	insertMany(objectsToInsert: any[]): Promise<any>;

	/**
	 * Return all the documents.
	 */
	findAll(): Promise<any[]>;

	/**
	 * Find all the documents that matches all attributes.
	 * @param attributes The attributes-value filters.
	 */
	findByAttributesAndOperator(attributes: AttributeFilter[]): Promise<any[]>;

	/**
	 * Find all the documents that matches only one of the attributes.
	 * @param attributes The attributes-value filters.
	 */
	findByAttributesOrOperator(attributes: AttributeFilter[]): Promise<any[]>;

	/**
	 * Find all the documents that matches the query.
	 * @param query A mongoose-like query.
	 */
	findByQuery(query: any): Promise<any[]>;
}
