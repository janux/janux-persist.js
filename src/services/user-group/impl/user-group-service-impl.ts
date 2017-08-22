/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");
import {GroupValueDao} from "../../../daos/group-content/group-value-dao";
import {GroupDao} from "../../../daos/group/group-dao";
import {GroupServiceImpl} from "../../group-module/impl/group-service";
import {UserGroupService} from "../api/user-group-service";

export class UserGroupServiceImpl implements UserGroupService {

    private groupDao: GroupDao;
    private groupContentDao: GroupValueDao;
    private groupService: GroupServiceImpl<any>;

    constructor(groupDao: GroupDao, groupContentDao: GroupValueDao) {
        this.groupDao = groupDao;
        this.groupContentDao = groupContentDao;
        this.groupService = new GroupServiceImpl<any>(groupDao, groupContentDao);
    }

    findAllGroupNames(): Promise<string> {
        return null;
    }

    insert(name: string, users: any[]): Promise<any> {
        return null;
    }

    update(name: string, updatesUsersList: any[]): Promise<any> {
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
