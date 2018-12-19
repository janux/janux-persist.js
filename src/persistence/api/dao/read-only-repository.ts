/**
 * Project janux-persistence
 * Created by ernesto on 7/28/17.
 */
import Promise = require("bluebird");
import { AttributeFilter } from "persistence/implementations/dao/attribute-filter";

/**
 * Define the methods for read only daos.
 */
export interface ReadOnlyRepository<t, ID> {
	/**
	 * Count all documents in the collection.
	 */
	count(): Promise<number>;

	/**
	 * Find one document by id.
	 * @param id The id to look for.
	 */
	findOne(id: ID): Promise<t>;

	/**
	 * Find all the documents that matches the query.
	 * @param query A mongoose-like query.
	 */
	findByQuery(query: any): Promise<t[]>;

	/**
	 * Find all the documents inside a collection whose ids belongs to the list.
	 * @param arrayOfIds The ids to look for.
	 */
	findByIds(arrayOfIds: ID[]): Promise<t[]>;

	/**
	 * Find one document inside the collection that has the attributeName and the value.
	 * @param attributeName The attribute to look for.
	 * @param value The value to compare.
	 */
	findOneByAttribute(attributeName: string, value): Promise<t>;

	/**
	 * Find all the documents inside the collection that has the attributeName and the value.
	 * @param attributeName The attribute to look for.
	 * @param value The value to compare.
	 */
	findByAttribute(attributeName: string, value): Promise<t[]>;

	/**
	 * Find all the documents inside the collection that has the attribute defined in the method and whose values
	 * belongs to the list.
	 * @param attributeName The attribute to look for.
	 * @param values The values to compare.
	 */
	findByAttributeNameIn(attributeName: string, values: any[]): Promise<t[]>;

	/**
	 * Return all the documents.
	 */
	findAll(): Promise<t[]>;

	/**
	 * Find all the documents that matches all attributes.
	 * @param attributes The attributes-value filters.
	 */
	findByAttributesAndOperator(attributes: AttributeFilter[]): Promise<t[]>;

	/**
	 * Find all the documents that matches only one of the attributes.
	 * @param attributes The attributes-value filters.
	 */
	findByAttributesOrOperator(attributes: AttributeFilter[]): Promise<t[]>;
}
