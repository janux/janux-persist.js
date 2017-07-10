/**
 * Project janux-persistence
 * Created by ernesto on 7/3/17.
 */
import * as Promise from "bluebird";
import * as _ from "lodash";
import * as logger from 'log4js';
import {PermissionBitEntity} from "../../daos/permission-bit/permission-bit-entity";
import {Persistence} from "../../daos/persistence";
import {RoleEntity} from "../../daos/role/role-entity";
import {RoleValidator} from "../../daos/role/role-validation";
import {UserRoleEntity} from "../../daos/user-role/user-role-entity";
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {RoleService} from "./role-service";

export class RoleServiceValidator {

    /**
     * Validate the info before insert or update
     * @param object
     * @param forceDeleteSubRoles
     * @return {any}
     */
    public static validate(object: any, forceDeleteSubRoles: boolean = false): Promise<any> {
        this._log.debug("Call to validate with object: %j", object);
        let errors: ValidationError[];
        const role: RoleEntity = new RoleEntity(
            object.name,
            object.description,
            object.enabled,
            object.isRoot,
            object.idParentRole
        );
        const id: any = object.id;
        errors = RoleValidator.validateRole(role);
        if (errors.length > 0) return Promise.reject(errors);
        return this.validatePermissionBits(object)
            .then(() => {
                return this.validatePermissionBitsIdsExistence(object);
            })
            .then(() => {
                return this.validateSubRoles(object, forceDeleteSubRoles);
            });
    }

    /**
     * Validate data before delete
     * @param roleIds
     * @param force
     * @return {Promise<UserRoleEntity[]>}
     */
    public static validateForDelete(roleIds: string[], force: boolean) {
        return Persistence.userRoleDao.findAllByRoleIdsIn(roleIds)
            .then((resultQuery: UserRoleEntity[]) => {
                if (resultQuery.length > 0 && force === false) {
                    return Promise.reject([
                        new ValidationError(RoleService.ACCOUNT, RoleService.ROLE_ASSOCIATED_WITH_ACCOUNT, "")
                    ]);
                } else {
                    return Promise.resolve(resultQuery);

                }
            });
    }

    private static _log = logger.getLogger("RoleServiceValidator");

    private static validateSubRoles(object: any, forceDeleteSubRole: boolean = false): Promise<any> {
        this._log.debug("Call to validateSubRoles with object: %j", object);
        let errors: ValidationError[];
        if (_.isArray(object.subRoles) && object.subRoles.length > 0) {

            // Validate the root role has the correct isRoot flag
            // and the correct idParentRole.
            if (object.isRoot !== true || _.isUndefined(object.idParentRole) === false) {
                return Promise.reject([
                    new ValidationError(RoleService.ROLE, RoleService.PARENT_ROLE_DATA_NOT_VALID, "")
                ]);
            }
            return Promise.map(object.subRoles, (childElement: any) => {
                const childRole: RoleEntity = new RoleEntity(
                    childElement.name,
                    childElement.description,
                    childElement.enabled,
                    false,
                    undefined
                );
                errors = RoleValidator.validateRoleExceptChildParentRelation(childRole);
                if (errors.length > 0) return Promise.reject(errors);
                return this.validatePermissionBits(childElement)
                    .then(() => {
                        // const idPermissionBits = _.map(childElement.permissionBits, (o: any) => o.id);
                        return this.validatePermissionBitsIdsExistence(childElement);
                    })
                    .then(() => {
                        return Promise.resolve(childRole);
                    });
            }).then((childRoles: any[]) => {
                return this.validateNames(childRoles);
            }).then(() => {
                return this.validatePotentialSubRoleDelete(object, forceDeleteSubRole);
            });
        } else {
            return Promise.resolve();
        }
    }

    /**
     * If by updating a role with children there are going to be deleted sub roles, then validate
     * if the sub roles are not associated with an account.
     * @param object
     * @param force
     * @return {any}
     */
    private static validatePotentialSubRoleDelete(object: any, force: boolean = false): Promise<any> {
        const subRoles: any[] = object.subRoles;
        if (isBlankString(object.id) === true) return Promise.resolve();
        // It's going to be an update and the role has sub roles.
        return Persistence.roleDao.findAllChildRoles(object.id)
            .then((existingSubRoles: RoleEntity[]) => {
                const idsSubRoles: string[] = subRoles.filter((value) => isBlankString(value) === false)
                    .map((value: any) => value.id);
                const existingIds: string[] = existingSubRoles.map((value) => value.id);
                const idsToDelete: string[] = _.xor(idsSubRoles, existingIds);
                // There are no sub roles that needs to be removed.
                if (idsToDelete.length === 0) return Promise.resolve();
                // Look for account associations
                return Persistence.userRoleDao.findAllByRoleIdsIn(idsToDelete)
                    .then((accountRoles: UserRoleEntity[]) => {
                        if (accountRoles.length === 0 || force === true) return Promise.resolve();
                        return Promise.reject([
                            new ValidationError(RoleService.ACCOUNT, RoleService.ROLE_ASSOCIATED_WITH_ACCOUNT, "")
                        ]);
                    });
            });
    }

    private static validateNames(childRoles: any[]) {
        const names: string[] = childRoles.map((value) => value.name);
        const uniqueNames = _.uniq(names);
        if (names.length !== uniqueNames.length) {
            return Promise.reject([
                new ValidationError(RoleService.SUB_ROLES_NAMES, RoleService.SUB_ROLES_DUPLICATED_NAMES, "")
            ]);
        }
        return Promise.map(childRoles, (element) => {
            const name: string = element.name;
            const id: any = isBlankString(element.id) ? undefined : element.id;
            return Persistence.roleDao.findOneByName(name)
                .then((role: RoleEntity) => {
                    if (role !== null && (_.isUndefined(id) || id === role.id)) {
                        return Promise.reject([
                            new ValidationError(RoleService.SUB_ROLES_NAMES, RoleService.SUB_ROLES_DUPLICATED_NAMES_IN_DATABASE, name)
                        ]);
                    } else {
                        return Promise.resolve();
                    }
                });
        })
            .then(() => {
                return Promise.resolve();
            });
    }

    private static validatePermissionBits(object: any): Promise<any> {
        this._log.debug("Call to validatePermissionBits with object:%j", object);
        const permissionBits: any[] = object.permissionBits;
        if (_.isArray(permissionBits) === false || permissionBits.length === 0) {
            // Rejecting early in order to avoid runtime errors.
            return Promise.reject([
                new ValidationError(RoleService.ROLE_PERMISSION_BIT, RoleService.ROLE_PERMISSION_BITS_EMPTY, "")
            ]);
        }
        const ids = permissionBits.map((value) => value.id);
        const rejected = _.filter(ids, (o) => {
            return _.isString(o) === false;
        });
        if (rejected.length > 0) {
            return Promise.reject([
                new ValidationError(RoleService.ROLE_PERMISSION_BIT, RoleService.PERMISSION_BITS_INVALID, "")
            ]);
        }

        return Promise.resolve();
    }

    private static validatePermissionBitsIdsExistence(object: any): Promise<any> {
        this._log.debug("Call to validatePermissionBitsIdsExistence with object:%j", object);
        let ids: string[] = _.map(object.permissionBits, (o: any) => o.id);
        ids = _.uniq(ids);
        return Persistence.permissionBitDao.findAllByIds(ids)
            .then((resultQuery: PermissionBitEntity[]) => {
                if (resultQuery.length !== ids.length) {
                    this._log.warn("Someone was trying to insert role-permission with an invalid permission bit id");
                    return Promise.reject([new ValidationError(
                        RoleService.ROLE_PERMISSION_BIT, RoleService.PERMISSION_BIT_NOT_IN_DATABASE,
                        ""
                    )]);
                } else {
                    return Promise.resolve();
                }
            });
    }
}
