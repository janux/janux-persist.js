/**
 * Project janux-persistence
 * Created by ernesto on 7/28/17.
 */
import * as Promise from "bluebird";
import {AttributeFilter} from "../../implementations/dao/attribute-filter";

/**
 * This interface dine the method you need to implement per each database
 * in order to wire the database to a AbstractDataAccessObjectWithAdapter instance.
 */
export interface DbAdapter {

    adapterProperties: any;

    /**
     * Find one document by id.
     * @param id The id to look for.
     */
    findOneMethod(id): Promise<any>;

    /**
     * Find all the documents inside a collection whose ids belongs to the list.
     * @param arrayOfIds The ids to look for.
     */
    findByIdsMethod(arrayOfIds: any[]): Promise<any>;

    /**
     * Remove a document.
     * @param objectToDelete The object to delete. This object must contain an attribute called "id" as string in
     * order to know which document to delete.
     */
    remove(objectToDelete: any): Promise<any>;

    /**
     * Remove a document whose id matches with the id parameter.
     * @param id The id query criteria.
     */
    removeById(id: any): Promise<any>;

    /**
     * Count all documents in the collection.
     */
    count(): Promise<number>;

    /**
     * Delete all documents inside the collection.
     */
    removeAll(): Promise<any>;

    /**
     * Delete all documents inside the collections whose ids matches the list.
     * @param ids ids A list of ids.
     */
    removeByIds(ids: any[]): Promise<any>;

    /**
     * Find one document inside the collection that has the attributeName and the value.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     */
    findOneByAttributeMethod(attributeName: string, value): Promise<any>;

    /**
     * Find all the documents inside the collection that has the attributeName and the value.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     */
    findByAttributeMethod(attributeName: string, value): Promise<any[]>;

    /**
     * Find all the documents inside the collection that has the attribute defined in the method and whose values
     * belongs to the list.
     * @param attributeName The attribute to look for.
     * @param values The values to compare.
     */
    findByAttributeNameInMethod(attributeName: string, values: any[]): Promise<any>;

    /**
     * Inserts a document.
     * @param objectToInsert The object to insertMethod.
     */
    insertMethod(objectToInsert: any): Promise<any>;

    /**
     * Update a document.
     * @param objectToUpdate The data to updateMethod. This object must have an attribute called "id" as string in order
     * to know which document is going to be updated.
     */
    updateMethod(objectToUpdate: any): Promise<any>;

    /**
     * Insert many documents at once inside the collection.
     * @param objectsToInsert The objects to insertMethod.
     */
    insertManyMethod(objectsToInsert: any[]): Promise<any>;

    /**
     * Return all the documents.
     */
    findAllMethod(): Promise<any[]>;

    /**
     * Find all the documents that matches all attributes.
     * @param attributes The attributes-value filters.
     */
    findByAttributesAndOperatorMethod(attributes: AttributeFilter[]): Promise<any[]>;

    /**
     * Find all the documents that matches only one of the attributes.
     * @param attributes The attributes-value filters.
     */
    findByAttributesOrOperatorMethod(attributes: AttributeFilter[]): Promise<any[]>;

    /**
     * Find all the documents that matches the query.
     * @param query A mongoose-like query.
     */
    findByQueryMethod(query: any): Promise<any[]>;
}
