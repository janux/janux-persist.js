/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import Promise = require("bluebird");
import {GroupValueDao} from "../../../daos/group-content/group-value-dao";
import {GroupDao} from "../../../daos/group/group-dao";
import {GroupImpl} from "../../group-module/impl/group";
import {GroupServiceImpl} from "../../group-module/impl/group-service";
import {UserService} from "../../user/user-service";
import {UserGroupService} from "../api/user-group-service";
import {UserListName} from "./user-name-list";

export class UserGroupServiceImpl implements UserGroupService {

    // This service handles the names of the different lists of users, plus each reference;
    // For the moment. There is going to be one list for all the system. But later
    // we need to decide if there is going to be one per tenant or one per user
    // Example of the content of this group could be "vendors", "users that needs clearance", "staff candidates".
    private groupServiceUserListNames: GroupServiceImpl<UserListName>;

    // List of the name of the users groups.
    private readonly GROUP_NAMES_NAME = "List of users groups";
    private readonly GROUP_NAMES_CODE = "USER NAMES LIST";

    // This is were the contest is retrieved. Ony we need to add records to this group when there a new users group.
    private groupListNames: GroupImpl<UserListName>;

    // This service handles all the different user groups. With this service we add or remove
    // the users associated to one group. For example, once there is a defined the group "staff candidates". This service
    // helps to retrieve the associated users to the group.
    // This group, instead of saving the user itself, it saves the user id reference.
    private groupServiceUsers: GroupServiceImpl<string>;

    // Needed for some queries.
    private userService: UserService;

    constructor(groupDao: GroupDao, groupValueDao: GroupValueDao, userService: UserService) {
        this.groupServiceUsers = new GroupServiceImpl<string>(groupDao, groupValueDao);
        this.groupServiceUserListNames = new GroupServiceImpl<UserListName>(groupDao, groupValueDao);
        this.userService = userService;
    }

    /**
     * Get all user group names.
     * @return {Bluebird<string[]>}
     */
    findAllGroupNames(): Promise<string[]> {
        return this.findOrInsertGroupListName()
            .then((groupNames: GroupImpl<UserListName>) => {
                const result: string[] = groupNames.values.map((value) => value.name);
                return Promise.resolve(result);
            });
    }

    /**
     * Returns the list of the users associated with the name.
     * @param {string} name
     * @return {Bluebird<GroupImpl<any>>}
     */
    findByName(name: string): Promise<GroupImpl<any>> {
        let userGroupReference: GroupImpl<string>;
        return this.findOrInsertGroupListName()
            .then((groupNames: GroupImpl<UserListName>) => {
                // Look for the name
                const userListNames: UserListName[] = groupNames.values.filter((value) => value.name === name);
                if (userListNames.length === 1) {
                    const selectedGroup: UserListName = userListNames[0];
                    // Once we have the name and the code, we can return the users group.
                    return this.groupServiceUsers.findOneByCode(selectedGroup.code);
                } else if (userListNames.length === 0) {
                    return Promise.reject("There are no users group with the name " + name);
                } else {
                    throw  new Error("There are two groups with the same name");
                }
            })
            .then((userGroup: GroupImpl<string>) => {
                // The group itself contains the users id reference.
                // We need to map the content.
                userGroupReference = userGroup;
                return this.userService.findByIdsIn(userGroup.values);
            })
            .then((users: any[]) => {
                // Map the users info to the result.
                const result: GroupImpl<any> = new GroupImpl();
                result.name = userGroupReference.name;
                result.code = userGroupReference.code;
                result.description = userGroupReference.description;
                result.values = users;
                return Promise.resolve(result);
            });
    }

    /**
     * Insert a new group or update an existing one.
     * @param {string} name The name of the group.
     * @param {any[]} users The users to insert or update.
     * @return {Promise<null>} Returns a promise indicating the
     * operation was successful, a reject if there is another users group
     * with the same name.
     */
    insertOrUpdate(name: string, users: any[]): Promise<GroupImpl<any>> {
        let result: GroupImpl<any>;
        let currentGroupNames: GroupImpl<UserListName>;
        let newGroupName: UserListName;
        return this.findOrInsertGroupListName()
            .then((groupNames: GroupImpl<UserListName>) => {
                currentGroupNames = groupNames;
                const userListNames: UserListName[] = groupNames.values.filter((value) => value.name === name);
                if (userListNames.length === 1) {
                    // There is a group with the defined name, let's get the info.
                    const selectedGroup: UserListName = userListNames[0];
                    return this.groupServiceUsers.findOneByCode(selectedGroup.code)
                        .then((userGroup: GroupImpl<string>) => {
                            // Let's update the users.
                            userGroup.values = users.map((value) => value.id);
                            return this.groupServiceUsers.update(userGroup);
                        });
                } else if (userListNames.length === 0) {
                    // Update the list of currentGroupNames.
                    newGroupName = new UserListName();
                    newGroupName.name = name;
                    newGroupName.code = "USERS GROUPS " + name + " BASED ON " + this.GROUP_NAMES_CODE;
                    currentGroupNames.values.push(newGroupName);
                    return this.groupServiceUserListNames.update(currentGroupNames)
                        .then((updateGroupNames: GroupImpl<UserListName>) => {
                            this.groupListNames = updateGroupNames;
                            // Create a new users group.
                            const newUsersGroup: GroupImpl<string> = new GroupImpl();
                            newUsersGroup.name = newGroupName.name;
                            newUsersGroup.code = newGroupName.code;
                            newUsersGroup.description = newGroupName.code;
                            newUsersGroup.values = users.map((value) => value.id);
                            return this.groupServiceUsers.insert(newUsersGroup);
                        });
                } else {
                    throw  new Error("There are two groups with the same name");
                }
            })
            .then((userGroup: GroupImpl<string>) => {
                // At this point we have an inserted or updated an users group.
                // Let's prepare the result.
                result = new GroupImpl();
                result.name = userGroup.name;
                result.code = userGroup.code;
                result.description = userGroup.description;
                result.values = users;
                return Promise.resolve(result);
            });
    }

    /**
     * Adds an user to a users list.
     * @param {string} name The name of the list.
     * @param user The user to be added.
     * @return {Bluebird<any>} Return a promise indicating the users has been inserted.
     * To the list, or a reject if there is no users group with this name.
     */
    addItem(name: string, user: any): Promise<any> {
        return this.findOrInsertGroupListName()
            .then((groupNames: GroupImpl<UserListName>) => {
                let filteredData: UserListName[];
                let groupWhereToAddUser: UserListName;
                filteredData = groupNames.values.filter((value) => value.name === name);
                if (filteredData.length === 1) {
                    groupWhereToAddUser = filteredData[0];
                    return this.groupServiceUsers.addItem(groupWhereToAddUser.code, user.id);
                } else if (filteredData.length === 0) {
                    return Promise.reject("There is no users group with the name " + name);
                } else {
                    throw  new Error("Two users groups with the same name");
                }
            });
    }

    /**
     * Removes an user from a group
     * @param {string} name The name of the group.
     * @param user The user to remove.
     * @return {Bluebird<any>}
     */
    remoteItem(name: string, user: any): Promise<any> {
        return this.findOrInsertGroupListName()
            .then((groupNames: GroupImpl<UserListName>) => {
                let filteredData: UserListName[];
                let groupWhereToAddUser: UserListName;
                filteredData = groupNames.values.filter((value) => value.name === name);
                if (filteredData.length === 1) {
                    groupWhereToAddUser = filteredData[0];
                    return this.groupServiceUsers.removeItem(groupWhereToAddUser.code, user.id);
                } else if (filteredData.length === 0) {
                    return Promise.reject("There is no users group with the name " + name);
                } else {
                    throw  new Error("Two users groups with the same name");
                }
            });
    }

    /**
     * Delete a group.
     * @param {string} name
     * @return {Promise<null>} Returns a promise if the operation
     * was successful. Returns a reject if there is no group with
     * this name.
     */
    remove(name: string): Promise<null> {
        let groupToRemove: UserListName;
        return this.findOrInsertGroupListName()
            .then((groupNames: GroupImpl<UserListName>) => {
                let filteredData: UserListName[];
                filteredData = groupNames.values.filter((value) => value.name === name);
                if (filteredData.length === 1) {
                    groupToRemove = filteredData[0];
                    // Remove the group from the list.
                    const index = groupNames.values.indexOf(groupToRemove);
                    groupNames.values.splice(index, 1);
                    return this.groupServiceUserListNames.update(groupNames);
                } else if (filteredData.length === 0) {
                    return Promise.reject("There is no users group with the name " + name);
                } else {
                    throw  new Error("Two users groups with the same name");
                }
            })
            .then((updatedGroupName: GroupImpl<UserListName>) => {
                this.groupListNames = updatedGroupName;
                // Remove the group itself.
                return this.groupServiceUsers.removeByCode(groupToRemove.code);
            });
    }

    /**
     * This method return the group that contains all the users group names,
     * @return {Bluebird<GroupImpl<UserListName>>}
     */
    private findOrInsertGroupListName(): Promise<GroupImpl<UserListName>> {
        if (this.groupListNames != null) {
            return Promise.resolve(this.groupListNames);
        } else {
            return this.groupServiceUserListNames.findOneByCode(this.GROUP_NAMES_CODE)
                .then((groupListNames: GroupImpl<UserListName>) => {
                    this.groupListNames = groupListNames;
                    return Promise.resolve(groupListNames);
                }, () => {
                    // Create a new group list;
                    const newGroup: GroupImpl<UserListName> = new GroupImpl();
                    newGroup.name = this.GROUP_NAMES_NAME;
                    newGroup.code = this.GROUP_NAMES_CODE;
                    this.groupListNames = newGroup;
                    return this.groupServiceUserListNames.insert(newGroup);
                });
        }
    }
}
