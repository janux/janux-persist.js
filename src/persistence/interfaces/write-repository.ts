/**
 * Project janux-persistence
 * Created by ernesto on 7/28/17.
 */

import Promise = require("bluebird");

/**
 * Define the method for saving, updating or deleting in a dao or
 * db-engine implementation.
 */
export interface IWriteRepository {

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
    removeById(id: string): Promise<any>;

    /**
     * Delete all documents inside the collection.
     */
    deleteAll(): Promise<any>;

    /**
     * Delete all documents inside the collections whose ids matches the list.
     * @param ids ids A list of ids.
     */
    deleteAllByIds(ids: string[]): Promise<any>;

    /**
     * Inserts a document.
     * @param objectToInsert The object to insert.
     */
    insert(objectToInsert: any): Promise<any>;

    /**
     * Update a document.
     * @param objectToUpdate The data to update. This object must have an attribute called "id" as string in order
     * to know which document is going to be updated.
     */
    update(objectToUpdate: any): Promise<any>;

    /**
     * Insert many documents at once inside the collection.
     * @param objectsToInsert The objects to insert.
     */
    insertMany(objectsToInsert: any[]): Promise<any>;

}
