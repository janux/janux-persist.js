/**
 * Project janux-persistence
 * Created by ernesto on 6/26/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import * as logger from 'log4js';
import {AccountRoleEntity} from "../../daos/account-role/account-role-entity";
import {AuthContextEntity} from "../../daos/auth-context/auth-context-entity";
import {PermissionBitEntity} from "../../daos/permission-bit/permission-bit-entity";
import {Persistence} from "../../daos/persistence";
import {RolePermissionBitEntity} from "../../daos/role-permission-bit/role-permission-bit-entity";
import {RoleEntity} from "../../daos/role/role-entity";
import {isBlankString} from "../../util/blank-string-validator";
import {RoleServiceValidator} from "./role-service-validator";

export class RoleService {

    public static ROLE_PERMISSION_BIT = "role.permissionBit";
    public static PERMISSION_BIT_NOT_IN_DATABASE = "Some permission bit ids does not exits in the database";
    public static ROLE_PERMISSION_BITS_EMPTY = "permissionBits is not an array or is empty";
    public static PERMISSION_BITS_INVALID = "The parameters does not have a valid permission bits data";
    public static ACCOUNT = "account";
    public static ROLE_ASSOCIATED_WITH_ACCOUNT = "This role is associated with one or more account";
    public static SUB_ROLES_NAMES = "subRoles.name";
    public static SUB_ROLES_DUPLICATED_NAMES = "Sub roles has duplicated role names";
    public static SUB_ROLES_DUPLICATED_NAMES_IN_DATABASE = "There are role in the database with the same name as the sub roles";
    public static PARENT_ROLE_DATA_NOT_VALID: "The parent role does not have the correct info ( isRoot is not true or idParent role is different than undefined";
    public static ROLE: string = "Role";

    /**
     * Insert a role an associate the permission bits to the role.
     * @param object
     * @return {Bluebird<any>}
     */
    public static  insert(object: any): Promise<any> {
        this._log.debug("Call to insert with object %j ", object);
        let result: any;
        return RoleServiceValidator.validate(object)
            .then(() => {
                // Insert the role
                const role: RoleEntity = new RoleEntity(
                    object.name,
                    object.description,
                    object.enabled,
                    object.isRoot,
                    object.idParentRole
                );
                return Persistence.roleDao.insert(role);
            })
            .then((insertedRole: RoleEntity) => {
                result = insertedRole;
                let idsPermissionBits = _.map(object.permissionBits, (o: any) => {
                    return o.id;
                });
                idsPermissionBits = _.uniq(idsPermissionBits);
                const associationsToInsert: RolePermissionBitEntity[] = [];
                for (const id of idsPermissionBits) {
                    associationsToInsert.push(new RolePermissionBitEntity(
                        insertedRole.id,
                        id
                    ));
                }
                return Persistence.rolePermissionBitDao.insertMany(associationsToInsert);
            })
            .then((insertedBits: RolePermissionBitEntity[]) => {
                const permissionBitIds = insertedBits.map((value) => value.idPermissionBit);
                // return Promise.resolve(result);
                return this.populateData(permissionBitIds);
            })
            .then((resultData) => {
                result.permissionBits = resultData;
                return this.insertOrUpdateSubRoles(result, object.subRoles);
            });
    }

    /**
     * Update the role.
     * @param object The role to update
     * @param forceDelete Force to delete the sub roles associations with accounts.
     * @return {Promise<any>}
     */
    public static update(object: any, forceDelete: boolean = false): Promise<any> {
        this._log.debug("Call to update with object: %j", object);
        let result: any;
        return RoleServiceValidator.validate(object, forceDelete)
            .then(() => {
                const role: any = new RoleEntity(
                    object.name,
                    object.description,
                    object.enabled,
                    object.isRoot,
                    object.idParentRole
                );
                role.dateCreated = object.dateCreated;
                role.id = object.id;
                return Persistence.roleDao.update(role);
            })
            .then((updatedRole: RoleEntity) => {
                result = updatedRole;
                return Persistence.rolePermissionBitDao.deleteAllByIdRole(object.id);
            })
            .then(() => {
                let idsPermissionBits = _.map(object.permissionBits, (o: any) => {
                    return o.id;
                });
                idsPermissionBits = _.uniq(idsPermissionBits);
                const associationsToInsert: RolePermissionBitEntity[] = [];
                for (const id of idsPermissionBits) {
                    associationsToInsert.push(new RolePermissionBitEntity(
                        result.id,
                        id
                    ));
                }
                return Persistence.rolePermissionBitDao.insertMany(associationsToInsert);
            })
            .then((insertedBits: RolePermissionBitEntity[]) => {
                const idPermissionBits = insertedBits.map((value) => value.idPermissionBit);
                return this.populateData(idPermissionBits);
            })
            .then((resultRecords) => {
                result.permissionBits = resultRecords;
                return this.removeSubRolesNotUsed(result, object.subRoles);
            })
            .then(() => {
                return this.insertOrUpdateSubRoles(result, object.subRoles);
            });
    }

    public static  findOneByName(name: string) {
        this._log.debug("Call to findOne by name:%j", name);
        return Persistence.roleDao.findOneByName(name)
            .then((resultQueryRole: RoleEntity) => {
                return this.prepareOneRecord(resultQueryRole);
            });
    }

    public static  findOneById(id: string) {
        this._log.debug("Call to findOne by id:%j", id);
        return Persistence.roleDao.findOneById(id)
            .then((resultQueryRole: RoleEntity) => {
                return this.prepareOneRecord(resultQueryRole);
            });
    }

    public static findAll(): Promise<any> {
        this._log.debug("Call to findAll");
        let result;
        return Persistence.roleDao.findAll()
            .then((resultRoles) => {
                result = resultRoles;
                return this.prepareSeveralRecords(result);
            });
    }

    public static  findAllByIds(ids: string[]) {
        this._log.debug("Call to findAllByIds with ids: %j", ids);
        return Persistence.roleDao.findAllByIds(ids)
            .then((roles: RoleEntity[]) => {
                return this.prepareSeveralRecords(roles);
            });
    }

    /* public static  hasPermissions(roleId: string, permissionBitNames: string[], authContextName: string): Promise<boolean> {
     this._log.debug("Call to hasPermissions with roleId: %j permissionBitNames: %j authContextName: %j", roleId, permissionBitNames, authContextName);

     return AuthContextService.findOneByName(authContextName)
     .then((result: any) => {
     if (result.enabled === false) {
     return Promise.resolve(false);
     }
     const permissionBitsToLookFor: any[] = _.filter(result.permissionBits, (o: any) => {
     return permissionBitNames.indexOf(o.name) >= 0;
     });
     const permissionBitIdsToValidate = permissionBitsToLookFor.map((value) => value.id);
     // return Persistence.rolePermissionBitDao.findAllByPermissionBitIdsIn(permissionBitsIdToValidate);
     return Promise.resolve(false);
     });
     }

     public static  hasPermission(role: any, permissionBitName: string[], authContextName: string): Promise<boolean> {
     return AuthContextService.findOneByName(authContextName)
     .then((result: any) => {
     if (result.enabled === false) {
     return Promise.resolve(false);
     }
     const availablePermissionBitNames = _.map(result.permissionBits, (o: any) => {
     return o.name;
     });
     return Promise.resolve(availablePermissionBitNames.indexOf(permissionBitName) >= 0);
     });
     }*/

    public static remove(role: any, force: boolean): Promise<any> {
        this._log.debug("Call to remove with role: %j, force: %j", role, force);
        // Validate if the role is associated with users.
        return RoleServiceValidator.validateForDelete([role.id], force)
            .then((accountsRoles: AccountRoleEntity[]) => {
                if (force === true) {
                    const ids = accountsRoles.map((value) => value.id);
                    return Persistence.accountRoleDao.deleteAllByIds(ids);
                } else {
                    return Promise.resolve();
                }
            })
            .then(() => {
                // Delete the associated permission bit.
                return Persistence.rolePermissionBitDao.deleteAllByIdRole(role.id);
            })
            .then(() => {
                return Persistence.roleDao.removeById(role.id);
            });
    }

    private static _log = logger.getLogger("RoleService");

    private static prepareSeveralRecords(roles: RoleEntity[]) {
        this._log.debug("Call to prepareSeveralRecords");
        const idsRole = roles.map((value, index, array) => value.id);
        const result: any = roles;
        let rolePermissionBits: RolePermissionBitEntity[];
        let permissionBits: PermissionBitEntity[];
        let authContexts: AuthContextEntity[];
        return Persistence.rolePermissionBitDao.findAllByRoleIdsIn(idsRole)
            .then((resultRolePermissionBits: RolePermissionBitEntity[]) => {
                rolePermissionBits = resultRolePermissionBits;
                const permissionBitIds = resultRolePermissionBits.map((value) => value.idPermissionBit);
                return Persistence.permissionBitDao.findAllByIds(permissionBitIds);
            })
            .then((resultPermissionBit: PermissionBitEntity[]) => {
                const authContextIds = resultPermissionBit.map((value) => value.idAuthContext);
                permissionBits = resultPermissionBit;
                return Persistence.authContextDao.findAllByIds(authContextIds);
            })
            .then((resultAuthContexts: AuthContextEntity[]) => {
                authContexts = resultAuthContexts;
                let roleBits: any;
                let bit: any;
                for (const role of result) {
                    const subRolePermissionBit = rolePermissionBits.filter((value) => value.idRole === role.id);
                    roleBits = [];
                    for (const subPermissionBit of subRolePermissionBit) {
                        bit = _.find(permissionBits, (o) => {
                            return o.id === subPermissionBit.idPermissionBit;
                        });
                        bit.authContext = _.find(authContexts, (o) => {
                            return o.id === bit.idAuthContext;
                        });
                        roleBits.push(bit);
                    }
                    role.permissionBits = roleBits;
                }
                return Promise.map(result, (element: any) => {
                    if (element.isRoot === false) {
                        return Promise.resolve(element);
                    } else {
                        return new Promise((resolve) => {
                            return Persistence.roleDao.findAllChildRoles(element.id)
                                .then((childRoles: RoleEntity[]) => {
                                    return this.findAllByIds(childRoles.map((value) => value.id))
                                        .then((resultChildRoles) => {
                                            element.subRoles = resultChildRoles;
                                            resolve(element);
                                        });
                                });
                        });
                    }
                });
            });
    }

    private static insertOrUpdateSubRoles(rootRole: any, subRoles: any): Promise<any> {
        this._log.debug("Call to insertOrUpdateSubRoles with rootRole: %j subRoles: %j", rootRole, subRoles);
        if (_.isArray(subRoles) === false || subRoles.length === 0 || rootRole.isRoot === false) {
            return Promise.resolve(rootRole);
        }
        return Promise.map(subRoles, (subRoleElement: any) => {
            let result: any;
            const subRole: RoleEntity = new RoleEntity(
                subRoleElement.name,
                subRoleElement.description,
                subRoleElement.enabled,
                false,
                rootRole.id
            );
            subRole.id = subRoleElement.id;
            return Persistence.roleDao.updateOrInsert(subRole)
                .then((insertedSubRole: RoleEntity) => {
                    result = insertedSubRole;
                    let idsPermissionBits = _.map(subRoleElement.permissionBits, (o: any) => {
                        return o.id;
                    });
                    idsPermissionBits = _.uniq(idsPermissionBits);
                    const associationsToInsert: RolePermissionBitEntity[] = [];
                    for (const id of idsPermissionBits) {
                        associationsToInsert.push(new RolePermissionBitEntity(
                            insertedSubRole.id,
                            id
                        ));
                    }
                    return Persistence.rolePermissionBitDao.insertMany(associationsToInsert);
                })
                .then((insertedBits: RolePermissionBitEntity[]) => {
                    const permissionBitIds = insertedBits.map((value) => value.idPermissionBit);
                    // return Promise.resolve(result);
                    return this.populateData(permissionBitIds);
                })
                .then((resultData) => {
                    result.permissionBits = resultData;
                    return Promise.resolve(result);
                });
        })
            .then((insertedSubRoles: any) => {
                rootRole.subRoles = insertedSubRoles;
                return Promise.resolve(rootRole);
            });
    }

    private static removeSubRolesNotUsed(rootRole: any, subRoles: any) {
        if (isBlankString(rootRole.id) === true)  return Promise.resolve();
        return Persistence.roleDao.findAllChildRoles(rootRole.id)
            .then((existingSubRoles: RoleEntity[]) => {
                const existingIds: string[] = existingSubRoles.map((value) => value.id);
                let idsToDelete: string[];
                if (_.isArray(subRoles) && subRoles.length > 0) {
                    const idsSubRoles: string[] = subRoles.filter((value: any) => isBlankString(value) === false)
                        .map((value: any) => value.id);
                    idsToDelete = _.xor(idsSubRoles, existingIds);
                } else {
                    idsToDelete = existingIds;
                }
                // There are no sub roles that needs to be removed.
                if (idsToDelete.length === 0) return Promise.resolve();
                // Look for account associations
                return Persistence.accountRoleDao.findAllByRoleIdsIn(idsToDelete)
                    .then((accountRoles: AccountRoleEntity[]) => {
                        const ids = accountRoles.map((value) => value.id);
                        return Persistence.accountRoleDao.deleteAllByIds(ids);
                    })
                    .then(() => {
                        return Promise.map(idsToDelete, (element) => {
                            return Persistence.rolePermissionBitDao.deleteAllByIdRole(element);
                        });
                    })
                    .then(() => {
                        return Persistence.roleDao.deleteAllByIds(idsToDelete);
                    });
            });
    }

    private static prepareOneRecord(role: RoleEntity): Promise<any> {
        this._log.debug("Call to prepareOneRecord with role: %j", role);
        let result: any;
        result = role;
        return Persistence.rolePermissionBitDao.findAllByRoleId(role.id)
            .then((resultRolePermissionBits: RolePermissionBitEntity[]) => {
                const permissionBitIds = resultRolePermissionBits.map((value) => value.idPermissionBit);
                return this.populateData(permissionBitIds);
            })
            .then((resultData) => {
                result.permissionBits = resultData;
                if (role.isRoot === true) {
                    return Persistence.roleDao.findAllChildRoles(role.id)
                        .then((childRoles: RoleEntity[]) => {
                            return this.findAllByIds(childRoles.map((value) => value.id));
                        })
                        .then((resultChildRoes: any) => {
                            result.subRoles = resultChildRoes;
                            return Promise.resolve(result);
                        });
                } else {
                    return Promise.resolve(result);
                }
            });
    }

    private static populateData(permissionBitIds: string[]): Promise<any> {
        this._log.debug("Call to populateData");
        let permissionBits: any;
        return Persistence.permissionBitDao.findAllByIds(permissionBitIds)
            .then((resultPermissionBit: PermissionBitEntity[]) => {
                permissionBits = resultPermissionBit;
                let authContextIds = resultPermissionBit.map((value) => value.idAuthContext);
                authContextIds = _.uniq(authContextIds);
                return Persistence.authContextDao.findAllByIds(authContextIds);
            })
            .then((resultAuthContexts: any) => {
                for (const bit of permissionBits) {
                    bit.authContext = _.find(resultAuthContexts, (o: any) => {
                        return o.id === bit.idAuthContext;
                    });
                }
                return Promise.resolve(permissionBits);
            });
    }
}
