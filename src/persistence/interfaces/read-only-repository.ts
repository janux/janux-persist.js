/**
 * Project janux-persistence
 * Created by ernesto on 7/28/17.
 */
import {AttributeFilter} from "../implementations/dao/attribute-filter";

/**
 * Define the methods for read only queries in a dao
 * or db engine
 */
export interface IReadOnlyRepository {
    /**
     * Count all documents in the collection.
     */
    count(): Promise<number>;

    /**
     * Find one document by id.
     * @param id The id to look for.
     */
    findOneById(id): Promise<any>;

    /**
     * Find all the documents that matches the query.
     * @param query A mongoose-like query.
     */
    findAllByQuery(query: any): Promise<any[]>;

    /**
     * Find all the documents inside a collection whose ids belongs to the list.
     * @param arrayOfIds The ids to look for.
     */
    findAllByIds(arrayOfIds: any[]): Promise<any>;

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
    findAllByAttribute(attributeName: string, value): Promise<any[]>;

    /**
     * Find all the documents inside the collection that has the attribute defined in the method and whose values
     * belongs to the list.
     * @param attributeName The attribute to look for.
     * @param values The values to compare.
     */
    findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<any>;

    /**
     * Return all the documents.
     */
    findAll(): Promise<any[]>;

    /**
     * Find all the documents that matches all attributes.
     * @param attributes The attributes-value filters.
     */
    findAllByAttributesAndOperator(attributes: AttributeFilter[]): Promise<any[]>;

    /**
     * Find all the documents that matches only one of the attributes.
     * @param attributes The attributes-value filters.
     */
    findAllByAttributesOrOperator(attributes: AttributeFilter[]): Promise<any[]>;
}
