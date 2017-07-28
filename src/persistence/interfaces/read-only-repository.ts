/**
 * Project janux-persistence
 * Created by ernesto on 7/28/17.
 */
import {AttributeFilter} from "../implementations/dao/attribute-filter";
import Promise = require("bluebird");

/**
 * Define the methods for read only daos.
 */
export interface IReadOnlyRepository<t> {
    /**
     * Count all documents in the collection.
     */
    count(): Promise<number>;

    /**
     * Find one document by id.
     * @param id The id to look for.
     */
    findOneById(id: string): Promise<t>;

    /**
     * Find all the documents that matches the query.
     * @param query A mongoose-like query.
     */
    findAllByQuery(query: any): Promise<t[]>;

    /**
     * Find all the documents inside a collection whose ids belongs to the list.
     * @param arrayOfIds The ids to look for.
     */
    findAllByIds(arrayOfIds: any[]): Promise<t[]>;

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
    findAllByAttribute(attributeName: string, value): Promise<t[]>;

    /**
     * Find all the documents inside the collection that has the attribute defined in the method and whose values
     * belongs to the list.
     * @param attributeName The attribute to look for.
     * @param values The values to compare.
     */
    findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<t[]>;

    /**
     * Return all the documents.
     */
    findAll(): Promise<t[]>;

    /**
     * Find all the documents that matches all attributes.
     * @param attributes The attributes-value filters.
     */
    findAllByAttributesAndOperator(attributes: AttributeFilter[]): Promise<t[]>;

    /**
     * Find all the documents that matches only one of the attributes.
     * @param attributes The attributes-value filters.
     */
    findAllByAttributesOrOperator(attributes: AttributeFilter[]): Promise<t[]>;
}
