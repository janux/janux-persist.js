/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import * as log4js from "log4js";
import {GroupValueDao} from "../../../daos/group-content/group-value-dao";
import {GroupValueEntity} from "../../../daos/group-content/group-value-entity";
import {GroupDao} from "../../../daos/group/group-dao";
import {GroupEntity} from "../../../daos/group/group-entity";
import {GroupValidator} from "../../../daos/group/group-validator";
import {ValidationErrorImpl} from "../../../persistence/implementations/dao/validation-error";
import {GroupService} from "../api/group-service";
import {GroupImpl} from "./group";

/**
 * Implementation of the group service.
 * As a comment. This service needs to handle attributes that are not recommended to
 * expose outside the project (the attribute code). In this case this service should not exposed to the internet.
 * Instead encapsulate the methods with another service.
 */
export class GroupServiceImpl<t> implements GroupService<t> {

    private groupDao: GroupDao;
    private groupValueDao: GroupValueDao;
    private log = log4js.getLogger("GroupServiceImpl");

    constructor(groupDao: GroupDao, groupValueDao: GroupValueDao) {
        this.groupDao = groupDao;
        this.groupValueDao = groupValueDao;
        this.log.debug("Constructor");
    }

    /**
     * Inserts a group.
     * @param {GroupImpl} group to insert.
     * @return {Promise<GroupImpl>} Returns a promise if the object was inserted correctly. Return a reject if
     * there is another group with the same code.
     */
    public insert(group: GroupImpl<t>): Promise<GroupImpl<t>> {
        this.log.debug("Call to insert group with group: %j", group);
        return this.groupDao.findOneByCode(group.code)
            .then((resultQuery: GroupEntity) => {
                if (resultQuery == null) {
                    const groupEntity = new GroupEntity();
                    groupEntity.name = group.name;
                    groupEntity.description = group.description;
                    groupEntity.code = group.code;
                    return this.groupDao.insert(groupEntity);
                } else {
                    this.log.warn("Inserting a group with duplicated code " + group.code);
                    return Promise.reject([new ValidationErrorImpl(GroupValidator.CODE, GroupValidator.CODE_DUPLICATED, group.code)]);
                }
            })
            .then((entity: GroupEntity) => {
                // Insert the records.
                const records: GroupValueEntity[] = group.values.map((value: any) => {
                    const groupContentEntity: GroupValueEntity = new GroupValueEntity();
                    groupContentEntity.idGroup = entity.id;
                    groupContentEntity.value = value;
                    return groupContentEntity;
                });
                return this.groupValueDao.insertMany(records);
            })
            .then(() => {
                return Promise.resolve(group);
            });
    }

    /**
     * Insert an item to a existing group.
     * @param {string} code The code of the group.
     * @param objectToInsert The item to insert.
     * @return {Promise<any>} Return a promise if successful, a reject if there is no group
     * with the specified code
     */
    public addItem(code: string, objectToInsert: t): Promise<null> {
        this.log.debug("Call to addItem with code: %j, objectToInsert: %j, validateDuplicated");
        return this.findGroup(code)
            .then((entity: GroupEntity) => {
                const groupVale: GroupValueEntity = new GroupValueEntity();
                groupVale.idGroup = entity.id;
                groupVale.value = objectToInsert;
                return this.groupValueDao.insert(groupVale);
            })
            .then(() => {
                return Promise.resolve(null);
            });

    }

    /**
     * Updates a group and it's values.
     * @param {Group} group The group to be updated.
     * @return {Promise<Group>} Returns a reject if there is no group with the same code.
     */
    update(group: GroupImpl<t>): Promise<GroupImpl<t>> {
        this.log.debug("Call to update with group %j", group);
        let groupEntity: GroupEntity;
        return this.findGroup(group.code)
            .then((result: GroupEntity) => {
                result.name = group.name;
                result.description = group.description;
                return this.groupDao.update(result);
            })
            .then((result: GroupEntity) => {
                groupEntity = result;
                // Remove the old items.
                return this.groupValueDao.removeAllByIdGroup(result.id);
            })
            .then(() => {
                // Insert the new values.
                const records: GroupValueEntity[] = group.values.map((value: any) => {
                    const groupContentEntity: GroupValueEntity = new GroupValueEntity();
                    groupContentEntity.idGroup = groupEntity.id;
                    groupContentEntity.value = value;
                    return groupContentEntity;
                });
                return this.groupValueDao.insertMany(records);
            })
            .then(() => {
                return Promise.resolve(group);
            });
    }

    /**
     * Delete group.
     * @param {Group} group The group to delete.
     * @return {Promise<any>}
     */
    remove(group: GroupImpl<t>): Promise<any> {
        this.log.debug("Call to remove with group: %j", group);
        return this.removeByCode(group.code);
    }

    /**
     * Delete group.
     * @param {Group} code The code of the group to delete.
     * @return {Promise<any>} Return a promise when the group has been deleted.
     */
    removeByCode(code: string): Promise<any> {
        this.log.debug("Call to removeByCode with group: %j", code);
        let entity: GroupEntity;
        return this.findGroup(code)
            .then((groupEntity: GroupEntity) => {
                entity = groupEntity;
                // Delete the values.
                return this.groupValueDao.removeAllByIdGroup(entity.id);
            })
            .then(() => {
                // Delete the group.
                return this.groupDao.remove(entity);
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    /**
     * Removes an item of the group.
     * @param {string} code The group code.
     * @param objectToRemove The object to remove.
     * Return a promise if the remove was successful. Returns a reject if there is group
     * with the specified code.
     */
    public removeItem(code: string, objectToRemove: t): Promise<null> {
        this.log.debug("Call to removeItem with code: %j object to remove %j", code, objectToRemove);
        return this.findGroup(code)
            .then((entity: GroupEntity) => {
                return this.groupValueDao.findByIdGroupAndValue(entity.id, objectToRemove);
            })
            .then((values: GroupValueEntity[]) => {
                const ids: string[] = values.map((value) => value.id);
                return this.groupValueDao.removeByIds(ids);
            });
    }

    /**
     * Get the group and it's items given a code
     * @param {string} code the code of the group.
     * @return {Promise<GroupImpl>} Return a promise with the group, a reject if there is no group
     * with the specified code.
     */
    public findOneByCode(code: string): Promise<GroupImpl<t>> {
        this.log.debug("Call to find with code %j", code);
        const result: GroupImpl<t> = new GroupImpl<any>();
        return this.findGroup(code)
            .then((groupEntity: GroupEntity) => {
                result.code = groupEntity.code;
                result.name = groupEntity.name;
                result.description = groupEntity.description;
                return this.groupValueDao.findByIdGroup(groupEntity.id);
            })
            .then((groupValues: GroupValueEntity[]) => {
                result.values = groupValues.map((item) => item.value);
                return Promise.resolve(result);
            });
    }

    /**
     * Return a group given a code
     * @param {string} code The code to look for.
     * @return {Bluebird<GroupEntity>} Return a promise with the code, or a reject if there is no record
     * with the specified code.
     */
    private findGroup(code: string): Promise<GroupEntity> {
        return this.groupDao.findOneByCode(code)
            .then((resultQuery: GroupEntity) => {
                if (resultQuery == null) {
                    return Promise.reject([new ValidationErrorImpl(GroupValidator.CODE, GroupValidator.CODE_DOES_NOT_EXITS, code)]);
                }
                return Promise.resolve(resultQuery);
            });
    }
}
