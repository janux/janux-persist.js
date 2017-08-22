/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");
import {Group} from "../../group-module/api/group";

export interface UserGroupService {
    /**
     * Get all group names that belong tho the users group
     * @return {Promise<string>}
     */
    findAllGroupNames(): Promise<string[]>;

    /**
     * Insert a new group or update an existing one.
     * @param {string} name The name of the group.
     * @param {any[]} users The users to insert.
     * @return {Promise<null>} Returns a promise indicating the
     * operation was successful, a reject if there is another users group
     * with the same name.
     */
    insertOrUpdate(name: string, users: any[]): Promise<Group<any>>;

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
    findByName(name: string): Promise<Group<any>>;

}
