/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import * as log4js from "log4js";
import {GroupAttributeValueEntity} from "../../../daos/group-attribute-value/group-attribute-value";
import {GroupAttributeValueDao} from "../../../daos/group-attribute-value/group-attribute-value-dao";
import {GroupContentDao} from "../../../daos/group-content/group-content-dao";
import {GroupContentEntity} from "../../../daos/group-content/group-content-entity";
import {GroupDao} from "../../../daos/group/group-dao";
import {GroupEntity} from "../../../daos/group/group-entity";
import {isDictionaryEqual} from "../../../util/dictionaryComparator";
import {GroupService} from "../api/group-service";
import {GroupImpl} from "./group";
import {GroupPropertiesImpl} from "./group-properties";
import {GroupServiceValidator} from "./group-validator";

/**
 * Implementation of the GroupImpl service.
 * As a comment. This service needs to handle attributes that are not recommended to
 * expose outside the project (the attribute code). In this case this service should not exposed to the internet.
 * Instead encapsulate the methods with another service.
 */
export class GroupServiceImpl<t> implements GroupService<t> {

    private groupDao: GroupDao;
    private groupContentDao: GroupContentDao;
    private groupAttributeValueDao: GroupAttributeValueDao;
    private log = log4js.getLogger("GroupServiceImpl");

    constructor(groupDao: GroupDao, groupContentDao: GroupContentDao, groupAttributeValueDao: GroupAttributeValueDao) {
        this.groupDao = groupDao;
        this.groupContentDao = groupContentDao;
        this.groupAttributeValueDao = groupAttributeValueDao;
        this.log.debug("Constructor");
    }

    /**
     * Return all group properties that shares the same type.
     * @param {string} type
     * @return {Bluebird<GroupProperties[]>} Return a list of group references.
     */
    findAllProperties(type: string): Promise<GroupPropertiesImpl[]> {
        this.log.debug("Call to findAllProperties with type %j", type);
        let groups: GroupEntity[];
        return this.groupDao.findByType(type)
            .then((resultQuery: GroupEntity[]) => {
                groups = resultQuery;
                const ids: string[] = groups.map((value) => value.id);
                return this.groupAttributeValueDao.findByIdsGroupIn(ids);
            })
            .then((resultQuery: GroupAttributeValueEntity[]) => {
                let result: GroupPropertiesImpl[];
                result = groups.map((value) => {
                    const element: GroupPropertiesImpl = new GroupPropertiesImpl();
                    element.name = value.name;
                    element.description = value.description;
                    element.attributes = this.attributesToDictionary(resultQuery.filter((value2) => value2.idGroup === value.id));
                    return element;
                });
                return Promise.resolve(result);
            });
    }

    /**
     * Find all groups that belongs to the same type.
     * @param {string} type The type to look for.
     * @return {Bluebird<Array<Group<t>>>} Return a list of groups. Returns an empty array if there is no
     * group with this type.
     */
    findAll(type: string): Promise<Array<GroupImpl<t>>> {
        this.log.debug("Call to findAll");
        let groups: GroupEntity[];
        let ids: string[];
        let attributesValues: GroupAttributeValueEntity[];
        let groupContent: GroupContentEntity[];
        return this.groupDao.findByType(type)
            .then((resultQuery: GroupEntity[]) => {
                groups = resultQuery;
                ids = groups.map((value) => value.id);
                return this.groupAttributeValueDao.findByIdsGroupIn(ids);
            })
            .then((resultQuery: GroupAttributeValueEntity[]) => {
                attributesValues = resultQuery;
                return this.groupContentDao.findByIdGroupsIn(ids);
            })
            .then((resultQuery: GroupContentEntity[]) => {
                groupContent = resultQuery;
                return Promise.resolve(this.mixData(groups, attributesValues, groupContent));
            });
    }

    /**
     * Find one group given the type and attributes.
     * @param {string} type
     * @param {} attributes The attributes to look for.
     * @return {Bluebird<Group<t>>} Return the group or null if there is no group given the type and
     * attributes.
     */
    findOne(type: string, attributes: { [p: string]: string }): Promise<GroupImpl<t>> {
        this.log.debug("Call to findOne with type %j, attributes: %j", type, attributes);
        let groupReference: GroupEntity;
        return this.findOneGroup(type, attributes)
            .then((group: GroupEntity) => {
                if (group == null) {
                    return Promise.resolve(null);
                } else {
                    groupReference = group;
                    return this.groupContentDao.findByIdGroup(group.id)
                        .then((resultQuery: GroupContentEntity[]) => {
                            const result: GroupImpl<t> = new GroupImpl();
                            result.type = groupReference.type;
                            result.properties.name = groupReference.name;
                            result.properties.description = groupReference.description;
                            result.properties.attributes = attributes;
                            result.values = resultQuery.map((value) => value.value);
                            return Promise.resolve(result);
                        });
                }
            });
    }

    /**
     * Find several groups and it's content.
     * @param {string} type. The type to look for.
     * @param {} filter A key-value map that will help to filter the groups that shares the same type. This is as a AND filter.
     * If there is an empty map then the method will return all groups of the same type.
     * @return {Bluebird<Group[]>} Return a list of groups. Returns an empty array if there is no group that qualifies
     * with the type and filter.
     */
    findByTypeAndFilter(type: string, filter: { [p: string]: string }): Promise<Array<GroupImpl<t>>> {
        this.log.debug("Call to findByTypeAndFilter with type: %j , filter: %j", type, filter);
        let groups: GroupEntity[];
        let groupsMathCriteria: GroupEntity[];
        let ids: string[];
        const lengtKeys = Object.keys(filter).length;
        let attributesValues: GroupAttributeValueEntity[];
        let groupContent: GroupContentEntity[];
        const amountKeys = Object.keys(filter).length;
        // Get all groups with the same type.
        return this.groupDao.findByType(type)
            .then((resultQuery: GroupEntity[]) => {
                groups = resultQuery;
                ids = groups.map((value) => value.id);
                // Get all key-value attributes.
                if (lengtKeys === 0) {
                    groupsMathCriteria = resultQuery;
                    return this.groupAttributeValueDao.findByIdsGroupIn(ids);
                } else {
                    return this.groupAttributeValueDao.findByIdGroupsAndKeyValuesMatch(ids, filter)
                        .then((resultQuery: GroupAttributeValueEntity[]) => {
                            groupsMathCriteria = groups.filter((value) => {
                                const keyValuePair = resultQuery.filter((keyValuePair) => keyValuePair.idGroup === value.id);
                                return keyValuePair.length === amountKeys;
                            });

                            ids = groupsMathCriteria.map((value) => value.id);
                            return this.groupAttributeValueDao.findByIdsGroupIn(ids);
                        });
                }
            })
            .then((resultQuery: GroupAttributeValueEntity[]) => {
                attributesValues = resultQuery;
                return this.groupContentDao.findByIdGroupsIn(ids);
            })
            .then((resultQuery: GroupContentEntity[]) => {
                groupContent = resultQuery;
                return Promise.resolve(this.mixData(groupsMathCriteria, attributesValues, groupContent));
            });
    }

    /**
     * Inserts a new group.
     * @param {GroupImpl} group to insert.
     * @return {Promise<GroupImpl>} Returns a promise if the object was inserted correctly. Return a reject if
     * there is another group with the same type and attributes. Returns a reject if the content of the groups
     * has duplicated values.
     */
    insert(group: GroupImpl<t>): Promise<GroupImpl<t>> {
        this.log.debug("Call to insert with group: %j", group);
        return this.findOneGroup(group.type, group.properties.attributes)
            .then((resultQuery: GroupEntity) => {
                if (resultQuery != null) {
                    this.log.warn("There is a group with the same type and attributes: %j", group);
                    return Promise.reject(GroupServiceValidator.DUPLICATED_GROUP);
                } else {
                    return this.insertToDatabase(group);
                }
            });

        // return this.groupDao.findByType(group.type)
        //     .then((resultQuery: GroupEntity[]) => {
        //         ids = resultQuery.map((value) => value.id);
        //         return this.groupAttributeValueDao.findByIdsGroupIn(ids);
        //     })
        //     .then((resultQuery: GroupAttributeValueEntity[]) => {
        //         for (const id of ids) {
        //             const attributesValues = resultQuery.filter((value) => value.idGroup === id);
        //             const keyValuesPair: {} = this.attributesToDictionary(attributesValues);
        //             if (isDictionaryEqual(group.properties.attributes, keyValuesPair)) {
        //                 this.log.warn("There is a group with the same type and attributes: %j", group);
        //                 return Promise.reject(GroupServiceValidator.DUPLICATED_GROUP);
        //             }
        //         }
        //         return this.insertToDatabase(group);
        //     });
    }

    /**
     * Updates a group and it's values.
     * @param {Group} group The group to be updated.
     * @return {Promise<Group>} Returns a reject if there is no group with the specified type an properties.
     * Returns a reject if the content of the groups has duplicated values.
     */
    update(group: GroupImpl<t>): Promise<GroupImpl<t>> {
        this.log.debug("Call to update with group %j", group);
        throw  new Error("Method not implemented");
    }

    /**
     * Delete group.
     * @param {Group} group The group to delete.
     * @return {Promise<any>} Returns a reject if there is no group with the same type an properties.
     */
    remove(group: GroupImpl<t>): Promise<any> {
        this.log.debug("Call to remove with group %j", group);
        return this.removeByTypeAndAttributes(group.type, group.properties.attributes);
    }

    /**
     * Remove one group given the type and it's attributes.
     * @param {string} type
     * @param {} attributes The attributes to look for. The method will find the group with the exact attributes.
     * @return {Bluebird<any>} Returns a reject if there is no group with the same type an properties.
     */
    removeByTypeAndAttributes(type: string, attributes: { [p: string]: string }): Promise<any> {
        this.log.debug("Call to removeByTypeAndAttributes with type: %j, attributes: %j", type, attributes);
        return this.findOneGroup(type, attributes)
            .then((resultQuery: GroupEntity) => {
                if (resultQuery == null) {
                    this.log.warn("There is no group given the type %j and attributes: %j", type, attributes);
                    return Promise.reject(GroupServiceValidator.NO_GROUP);
                } else {
                    return this.groupAttributeValueDao.removeAllByIdGroup(resultQuery.id)
                        .then(() => {
                            return this.groupContentDao.removeAllByIdGroup(resultQuery.id);
                        })
                        .then(() => {
                            return this.groupDao.remove(resultQuery);
                        }).then(() => {
                            return Promise.resolve();
                        });
                }
            });
    }

    /**
     * Insert an element to an existing group.
     * @param {string} type Type
     * @param {} attributes Attributes to identify groups of the same type.
     * @param {t} objectToInsert The value to insert.
     * @return {Bluebird<any>} Return a promise indicating the item is inserted. Returns a reject if
     * the method was not able to identify a group given the type and attributes. Returns a reject if
     * the objectToInsert exists already in the group.
     */
    addItem(type: string, attributes: { [p: string]: string }, objectToInsert: t): Promise<any> {
        this.log.debug("Call to addItem with type: %j, attributes: %j, objectToInsert: %j", type, attributes, objectToInsert);
        return this.findOneGroup(type, attributes)
            .then((group: GroupEntity) => {
                if (group == null) {
                    this.log.warn("There is no group given the type %j and attributes %j", type, attributes);
                    return Promise.reject(GroupServiceValidator.NO_GROUP);
                } else {
                    const newContent: GroupContentEntity = new GroupContentEntity();
                    newContent.idGroup = group.id;
                    newContent.value = objectToInsert;
                    return this.groupContentDao.insert(newContent);
                }
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    /**
     * Removes an item of the group.
     * @param {string} type The group type.
     * @param attributes the attributes to know which to group to delete.
     * @param objectToRemove The object to remove.
     * Return a promise if the remove was successful. Returns a reject if there is no
     * group given the type and attributes.
     */
    removeItem(type: string, attributes: { [p: string]: string }, objectToRemove: t): Promise<any> {
        this.log.debug("Call to removeIte with type: %j, attributes: %j", type, attributes);
        return this.findOneGroup(type, attributes)
            .then((group: GroupEntity) => {
                if (group == null) {
                    this.log.warn("There is no group given the type %j and attributes %j", type, attributes);
                    return Promise.reject("There is no group given the type and attributes");
                } else {
                    // Look for the content to delete.
                    return this.groupContentDao.findByIdGroupAndValue(group.id, objectToRemove);
                }
            })
            .then((objectsToRemove: GroupContentEntity[]) => {
                const ids = objectsToRemove.map((value) => value.id);
                return this.groupContentDao.removeByIds(ids);
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    /**
     * Returns a group or a null given a type and attributes
     * @param {string} type
     * @param {} attributes
     * @return {Bluebird<GroupEntity>}
     */
    private findOneGroup(type: string, attributes: { [p: string]: string }): Promise<GroupEntity> {
        let groups: GroupEntity[];
        let ids: string[];
        let groupReference: GroupEntity = null;
        // Get all groups with the same type.
        return this.groupDao.findByType(type)
            .then((resultQuery: GroupEntity[]) => {
                groups = resultQuery;
                ids = groups.map((value) => value.id);
                // find all key-values attributes of the selected groups.
                return this.groupAttributeValueDao.findByIdsGroupIn(ids);
            })
            .then((resultQuery: GroupAttributeValueEntity[]) => {
                let attributesValues: GroupAttributeValueEntity[];
                let attributesValuesDictionary: {};
                // Look fot the group that has the exact key-value pairs.
                for (const group of groups) {
                    attributesValues = resultQuery.filter((value) => value.idGroup === group.id);
                    attributesValuesDictionary = this.attributesToDictionary(attributesValues);
                    if (isDictionaryEqual(attributesValuesDictionary, attributes)) {
                        // Group founded.
                        groupReference = group;
                        break;
                    }
                }
                return Promise.resolve(groupReference);
            });
    }

    /**
     * Insert a group to a database once validated.
     * @param {GroupImpl<t>} group
     * @return {Bluebird<GroupImpl<t>>}
     */
    private insertToDatabase(group: GroupImpl<t>): Promise<GroupImpl<t>> {
        const groupEntity: GroupEntity = new GroupEntity();
        groupEntity.type = group.type;
        groupEntity.name = group.properties.name;
        groupEntity.description = group.properties.description;
        let insertedGroup: GroupEntity;
        // Insert group.
        return this.groupDao.insert(groupEntity)
            .then((resultInsert: GroupEntity) => {
                insertedGroup = resultInsert;
                // Insert content.
                const groupContent: GroupContentEntity[] = [];
                for (const obj of group.values) {
                    const groupContentEntity: GroupContentEntity = new GroupContentEntity();
                    groupContentEntity.idGroup = resultInsert.id;
                    groupContentEntity.value = obj;
                    groupContent.push(groupContentEntity);
                }
                return this.groupContentDao.insertMany(groupContent);
            })
            .then(() => {
                // Insert attributes-values.
                const attributeValues: GroupAttributeValueEntity[] = [];
                for (const key in group.properties.attributes) {
                    const attributeValue = new GroupAttributeValueEntity();
                    attributeValue.idGroup = insertedGroup.id;
                    attributeValue.key = key;
                    attributeValue.value = group.properties.attributes[key];
                    attributeValues.push(attributeValue);
                }
                return this.groupAttributeValueDao.insertMany(attributeValues);
            })
            .then(() => {
                return Promise.resolve(group);
            });
    }

    /**
     * Convert a array of  GroupAttributeValueEntity to a dictionary.
     * @param {GroupAttributeValueEntity[]} attributes
     * @return {{}}
     */
    private attributesToDictionary(attributes: GroupAttributeValueEntity[]): {} {
        const result = {};
        for (const obj of attributes) {
            result[obj.key] = obj.value;
        }
        return result;
    }

    private mixData(groups: GroupEntity[],
                    attributeValues: GroupAttributeValueEntity[],
                    groupContent: GroupContentEntity[]): Array<GroupImpl<t>> {
        const result: Array<GroupImpl<t>> = [];
        let group: GroupImpl<t>;
        for (const element of groups) {
            group = new GroupImpl();
            group.type = element.type;
            group.properties.name = element.name;
            group.properties.description = element.description;
            group.properties.attributes = this.attributesToDictionary(attributeValues
                .filter((value) => value.idGroup === element.id));
            group.values = groupContent.filter((value) => value.idGroup === element.id)
                .map((value) => value.value);
            result.push(group);
        }
        return result;
    }
}
