/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");
import {GroupContentDao} from "../../../daos/group-content/group-content-dao";
import {GroupDao} from "../../../daos/group/group-dao";
import {UserGroupService} from "../api/user-group-service";

export class UserGroupServiceImpl implements UserGroupService {

    private groupDao: GroupDao;
    private groupContentDao: GroupContentDao;

    constructor(groupDao: GroupDao, groupContentDao: GroupContentDao) {
        this.groupDao = groupDao;
        this.groupContentDao = groupContentDao;
    }

    findAllUserGroups(): Promise<string> {
        return null;
    }

    insertGroup(name: string, users: any[]): Promise<any> {
        return null;
    }

    updateUsersGroup(name: string, updatesUsersList: any[]): Promise<any> {
        return null;
    }

    updateNameGroup(oldName: string, newName: string): Promise<null>  {
        return null;
    }

    deleteGroup(name: string): Promise<any> {
        return null;
    }

    getUsers(name: string): Promise<any[]> {
        return null;
    }
}
