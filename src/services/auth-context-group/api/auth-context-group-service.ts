/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");

export interface AuthContextGroupService {
    /**
     * Get all group names that belong tho the auth context groups
     * @return {Promise<string>}
     */
    findAllAuthContextGroups(): Promise<string>;

    /**
     * Insert a new auth context group
     * @param {string} name The name of the group.
     * @param {any[]} authContexts The auth contexts to store.
     * @return {Promise<null>} Returns a promise indicating the
     * operation was successful, a reject if there is another authContexts group
     * with the same name.
     */
    insertGroup(name: string, authContexts: any[]): Promise<null>;

    /**
     * Update the auth context group.
     * @param {string} name the group whose content is going to updated.
     * @param {any[]} updatedAuthContextList The new list.
     * @return {Promise<any>} Returns a promise if the operation
     * was successful. Returns a reject if there is no group with
     * this name.
     */
    updateAuthContextGroup(name: string, updatedAuthContextList: any[]): Promise<null>;

    /**
     * Update a name of the auth contexts group.
     * @param {string} oldName
     * @param {string} newName
     * @return Returns a promise indicating the operation was successful, a reject if there is no group with the oldName.
     */
    updateNameGroup(oldName: string, newName: string): Promise<null>;

    /**
     * Delete a group.
     * @param {string} name
     * @return {Promise<null>} Returns a promise if the operation
     * was successful. Returns a reject if there is no group with
     * this name.
     */
    deleteGroup(name: string): Promise<null>;

    /**
     * Return the auth contexts that belongs to the group.
     * @param {string} name The name of the group to look for,
     * @return {Promise<any[]>} Returns a promise with the list of auth contexts. Return a reject if there is no
     * group with this name.
     */
    getAuthContexts(name: string): Promise<any[]>;
}
