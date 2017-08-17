/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");
import * as logger from 'log4js';
import {GroupContentDao} from "../../../daos/group-content/group-content-dao";
import {GroupDao} from "../../../daos/group/group-dao";
import {AuthContextGroupService} from "../api/auth-context-group-service";

export class AuthContextGroupServiceImpl implements AuthContextGroupService {

    // This is the group code where the service stores all group references
    // related to the auth context groups service.
    private readonly parentGroupCode: string = "Janux Demos auth context parent group";
    private groupDao: GroupDao;
    private groupContentDao: GroupContentDao;
    private log = logger.getLogger("AuthContextGroupServiceImpl");

    constructor(groupDao: GroupDao, groupContentDao: GroupContentDao) {
        this.groupDao = groupDao;
        this.groupContentDao = groupContentDao;
    }

    findAllAuthContextGroups(): Promise<string> {
        return null;
    }

    insertGroup(name: string, authContexts: any[]): Promise<any> {
        return null;
    }

    updateAuthContextGroup(name: string, updatedAuthContextList: any[]): Promise<any> {
        return null;
    }

    updateNameGroup(oldName: string, newName: string): Promise<null> {
        return null;
    }

    deleteGroup(name: string): Promise<any> {
        return null;
    }

    getAuthContexts(name: string): Promise<any[]> {
        return null;
    }
}
