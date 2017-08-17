/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");
import {Group} from "./group";

export interface GroupService {

    /**
     * Inserts a group. If there is a group with the same code.
     * @param {GroupImpl} group to insert.
     * @return {Promise<GroupImpl>} Returns a promise if the object was inserted correctly. Return a reject if
     * there is another group with the same code.
     */
    insertGroup(group: Group): Promise<Group>;

    /**
     * Updates a group and it's content.
     * @param {Group} group The group to be updated.
     * @return {Promise<Group>} Returns a reject if there is no group with the same code.
     */
    updateGroup(group: Group): Promise<Group>;

    /**
     * Delete group.
     * @param {Group} group The group to delete.
     * @return {Promise<any>}
     */
    deleteGroup(group: Group): Promise<null>;

    /**
     * Insert a reference to an existing group.
     * @param {string} code The name of the group.
     * @param objectToInsert The object to insert.
     * @param {boolean} validateDuplicated If true, the method is going to validate and reject if the reference exists in another
     * groups with the same collectionName that belongs the group.
     * @return {Promise<any>} Return a promise if successful,  a reject the following conditions arise.
     * There is no record with the same name.
     * If validateDuplicated is true. Then the method rejects is the reference belong to another group with the same collectionName.
     */
    addObjectToGroup(code: string, objectToInsert: any, validateDuplicated: boolean): Promise<null>;

    /**
     * Removes an object of the group.
     * @param {string} code The group code.
     * @param objectToRemove The object to remove.
     * Return a promise if the removal was successful. Returns a reject if the object
     * to remove does not belong to the group.
     */
    removeReferenceToGroup(code: string, objectToRemove: any): Promise<null>;

    /**
     * Get the group and it's content.
     * @param {string} code
     * @return {Promise<GroupImpl>}
     */
    findGroup(code: string): Promise<Group>;
}
