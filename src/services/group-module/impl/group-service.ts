/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import * as log4js from "log4js";
import {GroupContentDao} from "../../../daos/group-content/group-content-dao";
import {GroupContentEntity} from "../../../daos/group-content/group-content-entity";
import {GroupDao} from "../../../daos/group/group-dao";
import {GroupEntity} from "../../../daos/group/group-entity";
import {GroupService} from "../api/group-service";
import {GroupImpl} from "./group";

/**
 * Implementation of the group service.
 * As a comment. This service needs to handle attributes that are not recommended to
 * expose outside the project (the attribute code)0. In this case this service should not exposed to the internet.
 * Instead encapsulate the methods with another service.
 */
export class GroupServiceImpl implements GroupService {

    private groupDao: GroupDao;
    private groupContentDao: GroupContentDao;
    private log = log4js.getLogger("GroupServiceImpl");

    constructor(groupDao: GroupDao, groupContentDao: GroupContentDao) {
        this.groupDao = groupDao;
        this.groupContentDao = groupContentDao;
        this.log.debug("Constructor");
    }

    public insertGroup(group: GroupImpl): Promise<any> {
        this.log.debug("Call to insert group with group: %j", group);
        let entity: GroupEntity;
        return this.groupDao.findOneByCode(group.name)
            .then((resultQuery: GroupEntity) => {
                if (resultQuery == null) {
                    const groupEntity = new GroupEntity();
                    groupEntity.name = group.name;
                    groupEntity.description = group.description;
                    return this.groupDao.insert(groupEntity);
                } else {
                    return Promise.resolve(resultQuery);
                }
            })
            .then((groupEntity: GroupEntity) => {
                entity = groupEntity;
                return this.groupContentDao.deleteAllByIdGroup(groupEntity['id']);
            })
            .then(() => {
                // Insert the records.
                const records: GroupContentEntity[] = group.content.map((value: any) => {
                    const groupContentEntity: GroupContentEntity = new GroupContentEntity();
                    groupContentEntity.idGroup = entity.id;
                    groupContentEntity.objectGroup = value.id;
                    return groupContentEntity;
                });
                return this.groupContentDao.insertMany(records);
            });
    }

    updateGroup(group: GroupImpl): Promise<GroupImpl> {
        this.log.debug("Call to updateGroup with group %j", group);
        return null;
    }

    deleteGroup(group: GroupImpl): Promise<any> {
        this.log.debug("Call to deleteGroup with group: %j", group);
        return null;
    }

    /**
     * Add object to a group
     * @param {string} code GroupImpl where the object is going gto be inserted.
     * @param objectToInsert The object to insert.
     * @return {Promise<any>}
     */
    public addObjectToGroup(code: string, objectToInsert: any): Promise<null> {
        this.log.debug("Call to addObjectToGroup with code: %j, objectToInsert: %j, validateDuplicated")
        let groupEntity: GroupEntity;
        // Find the group
        return this.groupDao.findOneByCode(code)
            .then((resultQuery: GroupEntity) => {
                if (resultQuery == null) {
                    return Promise.reject("There is no group with the code " + code);
                }
                groupEntity = resultQuery;
            });
    }

    /**
     * Remove and object to the group.
     * @param {string} code
     * @param objectToRemove
     */
    public removeReferenceToGroup(code: string, objectToRemove: any): Promise<null> {
        throw new Error("Method not implemented.");
    }

    /**
     * Get the group and it's content given a code
     * @param {string} code the code of the group.
     * @return {Promise<GroupImpl>}
     */
    public findGroup(code: string): Promise<GroupImpl> {
        return null;
    }
}
