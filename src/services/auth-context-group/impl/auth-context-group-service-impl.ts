/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");
import * as logger from 'log4js';
import {GroupValueDao} from "../../../daos/group-content/group-value-dao";
import {GroupDao} from "../../../daos/group/group-dao";
import {AuthContextGroupService} from "../api/auth-context-group-service";

export class AuthContextGroupServiceImpl implements AuthContextGroupService {

    // This is the group code where the service stores all group references
    // related to the auth context groups service.
    private readonly parentGroupCode: string = "Janux Demos auth context parent group";
    private groupDao: GroupDao;
    private groupContentDao: GroupValueDao;
    private log = logger.getLogger("AuthContextGroupServiceImpl");

    constructor(groupDao: GroupDao, groupContentDao: GroupValueDao) {
        this.groupDao = groupDao;
        this.groupContentDao = groupContentDao;
    }

    findAllGroupNames(): Promise<string[]> {
        return null;
    }

    insert(name: string, authContexts: any[]): Promise<any> {
        return null;
    }

    update(name: string, updatedAuthContextList: any[]): Promise<any> {
        return null;
    }

    updateName(oldName: string, newName: string): Promise<null> {
        return null;
    }

    remove(name: string): Promise<any> {
        return null;
    }

    getItems(name: string): Promise<any[]> {
        return null;
    }
}
