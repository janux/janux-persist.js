/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import * as log4js from "log4js";
import {GroupValueDao} from "../../../daos/group-content/group-value-dao";
import {GroupDao} from "../../../daos/group/group-dao";
import {GroupService} from "../api/group-service";
import {GroupImpl} from "./group";
import {GroupPropertiesImpl} from "./group-properties";

/**
 * Implementation of the GroupImpl service.
 * As a comment. This service needs to handle attributes that are not recommended to
 * expose outside the project (the attribute code). In this case this service should not exposed to the internet.
 * Instead encapsulate the methods with another service.
 */
export class GroupImplServiceImpl<t> implements GroupService<t> {

    private groupDao: GroupDao;
    private groupValueDao: GroupValueDao;
    private log = log4js.getLogger("GroupImplServiceImpl");

    constructor(groupDao: GroupDao, groupValueDao: GroupValueDao) {
        this.groupDao = groupDao;
        this.groupValueDao = groupValueDao;
        this.log.debug("Constructor");
    }

    /**
     * Return all group properties that shares the same type.
     * @param {string} type
     * @return {Bluebird<GroupProperties[]>} Return a list of group references.
     */
    findAllProperties(type: string): Promise<GroupPropertiesImpl[]> {
        return null;
    }

    /**
     * Find all groups that belongs to the same type.
     * @param {string} type The type to look for.
     * @return {Bluebird<Array<Group<t>>>} Return a list of groups. Returns an empty array if there is no
     * group with this type.
     */
    findAll(type: string): Promise<Array<GroupImpl<t>>> {
        return null;
    }

    /**
     * Find one group given the type and attributes.
     * @param {string} type
     * @param {} attributes The attributes to look for.
     * @return {Bluebird<Group<t>>} Return the group or null if there is no group given the type and
     * attributes.
     */
    findOne(type: string, attributes: { [p: string]: string }): Promise<GroupImpl<t>> {
        return null;
    }

    /**
     * Find many groups and it's content.
     * @param {string} type. The type to look for.
     * @param {} filter A key-value map that will help to filter the groups that shares the same type. This is as a AND filter.
     * If there is an empty map then the method will return all records of the same type.
     * @return {Bluebird<Group[]>} Return a list of groups. Returns an empty array if there is no group that qualifies
     * with the type and filter.
     */
    findByTypeAndFilter(type: string, filter: { [p: string]: string }): Promise<Array<GroupImpl<t>>> {
        return null;
    }

    /**
     * Inserts a new group.
     * @param {GroupImpl} group to insert.
     * @return {Promise<GroupImpl>} Returns a promise if the object was inserted correctly. Return a reject if
     * there is another group with the same type and attributes. Returns a reject if the content of the groups
     * has duplicated values.
     */
    insert(group: GroupImpl<t>): Promise<GroupImpl<t>> {
        return null;
    }

    /**
     * Updates a group and it's values.
     * @param {Group} group The group to be updated.
     * @return {Promise<Group>} Returns a reject if there is no group with the specified type an properties.
     * Returns a reject if the content of the groups has duplicated values.
     */
    update(group: GroupImpl<t>): Promise<GroupImpl<t>> {
        return null;
    }

    /**
     * Delete group.
     * @param {Group} group The group to delete.
     * @return {Promise<any>} Returns a reject if there is no group with the same type an properties.
     */
    remove(group: GroupImpl<t>): Promise<any> {
        return null;
    }

    /**
     * Remove one group given the type and it's attributes.
     * @param {string} type
     * @param {} attributes The attributes to look for. The method will fin the group with the exact attributes.
     * @return {Bluebird<any>} Returns a reject if there is no group with the same type an properties.
     */
    removeByTypeAndAttributes(type: string, attributes: { [p: string]: string }): Promise<any> {
        return null;
    }

    /**
     * Insert an element to an existing group.
     * @param {string} type Type
     * @param {} attributes Attributes to identify groups of the same type.
     * @param {t} objectToInsert The value to insert.
     * @return {Bluebird<any>} Return a promise indicating the group is inserted. Returns a reject if
     * the method was not able to identify a group given the type and attributes. Returns a reject if
     * the objectToInsert exists already in the group.
     */
    addItem(type: string, attributes: { [p: string]: string }, objectToInsert: t): Promise<any> {
        return null;
    }

    /**
     * Removes an item of the group.
     * @param {string} type The group type.
     * @param attributes the attributes to know which to group to delete.
     * Return a promise if the remove was successful. Returns a reject if there is no
     * record given the type and attributes.
     */
    removeItem(type: string, attributes: { [p: string]: string }): Promise<any> {
        return null;
    }
}
