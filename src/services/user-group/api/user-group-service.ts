/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");

export interface UserGroupService {
    /**
     * Get all group names that belong tho the users group
     * @return {Promise<string>}
     */
    findAllGroupNames(): Promise<string>;

    /**
     * Insert a new group
     * @param {string} name The name of the group.
     * @param {any[]} users The users to insert.
     * @return {Promise<null>} Returns a promise indicating the
     * operation was successful, a reject if there is another users group
     * with the same name.
     */
    insert(name: string, users: any[]): Promise<null>;

    /**
     * Update the users group.
     * @param {string} name the group whose values is going to updated.
     * @param {any[]} updatesUsersList The new list.
     * @return {Promise<any>} Returns a promise if the operation
     * was successful. Returns a reject if there is no group with
     * this name.
     */
    update(name: string, updatesUsersList: any[]): Promise<null>;

    /**
     * Update a name of the users group.
     * @param {string} oldName
     * @param {string} newName
     * @return Returns a promise indicating the operation was successful, a reject if there is no group with the oldName.
     */
    updateName(oldName: string, newName: string): Promise<null> ;

    /**
     * Delete a group.
     * @param {string} name
     * @return {Promise<null>} Returns a promise if the operation
     * was successful. Returns a reject if there is no group with
     * this name.
     */
    remove(name: string): Promise<null>;

    /**
     * Return the users that belongs to the group.
     * @param {string} name The name of the group to look for,
     * @return {Promise<any[]>} Returns a promise with the list of users. Return a reject if there is no
     * group with this name.
     */
    getItems(name: string): Promise<any[]>;

}
