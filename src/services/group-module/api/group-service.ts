/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");
import {Group} from "./group";

export interface GroupService<t> {

    /**
     * Inserts a group.
     * @param {GroupImpl} group to insert.
     * @return {Promise<GroupImpl>} Returns a promise if the object was inserted correctly. Return a reject if
     * there is another group with the same code.
     */
    insert(group: Group<t>): Promise<Group<t>>;

    /**
     * Updates a group and it's values.
     * @param {Group} group The group to be updated.
     * @return {Promise<Group>} Returns a reject if there is no group with the same code.
     */
    update(group: Group<t>): Promise<Group<t>>;

    /**
     * Delete group.
     * @param {Group} group The group to delete.
     * @return {Promise<any>}
     */
    remove(group: Group<t>): Promise<null>;

    /**
     * Delete group.
     * @param {Group} code The code of the group to delete.
     * @return {Promise<any>} Return a promise when the group has been deleted.
     */
    removeByCode(code: string): Promise<null>;

    /**
     * Insert an user to a existing group.
     * @param {string} code The code of the group.
     * @param objectToInsert The item to insert.
     * @return {Promise<any>} Return a promise if successful, a reject if there is no group
     * with the specified code
     */
    addItem(code: string, objectToInsert: t): Promise<null>;

    /**
     * Removes an item of the group.
     * @param {string} code The group code.
     * @param objectToRemove The object to remove.
     * Return a promise if the remove was successful. Returns a reject if there is group
     * with the specified code.
     */
    removeItem(code: string, objectToRemove: t): Promise<null>;

    /**
     * Get the group and it's items given a code
     * @param {string} code the code of the group.
     * @return {Promise<GroupImpl>} Return a promise with the group, a reject if there is no group
     * with the specified code.
     */
    findOneByCode(code: string): Promise<Group<t>>;
}
