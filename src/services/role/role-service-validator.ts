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
import {ValidationError} from "../../persistence/impl/validation-error";
import {RoleService} from "./role-service";

export class RoleServiceValidator {

    public static validate(object: any): Promise<any> {
        this._log.debug("Call to validate with object: %j", object);
        let errors: ValidationError[];
        const role: RoleEntity = new RoleEntity(
            object.name,
            object.description,
            object.enabled,
            object.isRoot,
            object.idParentRole
        );
        errors = RoleValidator.validateRole(role);
        if (errors.length > 0) return Promise.reject(errors);
        return this.validatePermissionBits(object)
            .then(() => {
                // const idPermissionBits = _.map(object.permissionBits, (o: any) => o.id);
                return this.validatePermissionBitsIdsExistence(object);
            })
            .then(() => {
                return this.validateSubRoles(object);
            });
    }

    private static _log = logger.getLogger("RoleServiceValidator");

    private static validateSubRoles(object: any): Promise<any> {
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
            });
        } else {
            return Promise.resolve();
        }
    }

    private static validateNames(childRoles: any[]) {
        const names: string[] = childRoles.map((value) => value.name);
        const uniqueNames = _.uniq(names);
        if (names.length !== uniqueNames.length) {
            return Promise.reject([
                new ValidationError(RoleService.SUB_ROLES_NAMES, RoleService.SUB_ROLES_DUPLICATED_NAMES, "")
            ]);
        }
        return Persistence.roleDao.findAllByNamesIn(names)
            .then((duplicatedRoles: RoleEntity[]) => {
                // Check for duplicated names in the database.
                if (duplicatedRoles.length > 0) {
                    return Promise.reject([
                        new ValidationError(RoleService.SUB_ROLES_NAMES, RoleService.SUB_ROLES_DUPLICATED_NAMES_IN_DATABASE, "")
                    ]);
                } else {
                    return Promise.resolve();
                }
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
