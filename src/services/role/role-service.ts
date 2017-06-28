/**
 * Project janux-persistence
 * Created by ernesto on 6/26/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import * as logger from 'log4js';
import {AuthContextEntity} from "../../daos/auth-context/auth-context-entity";
import {PermissionBitEntity} from "../../daos/permission-bit/permission-bit-entity";
import {Persistence} from "../../daos/persistence";
import {RolePermissionBitEntity} from "../../daos/role-permission-bit/role-permission-bit-entity";
import {RoleEntity} from "../../daos/role/role-entity";
import {RoleValidator} from "../../daos/role/role-validation";
import {ValidationError} from "../../persistence/impl/validation-error";
import {BootstrapService} from "../bootstrap/bootstrap-service";

export class RoleService {

    public static ROLE_PERMISSION_BIT = "role.permissionBit";
    public static PERMISSION_BIT_NOT_IN_DATABASE = "Some permission bit ids does not exits in the database";
    public static ROLE_PERMISSION_BITS_EMPTY = "permissionBits is not an array or is empty";

    public static  insert(object: any): Promise<any> {
        this._log.debug("Call to insert with object %j ", object);
        let result: any;
        return this.validate(object)
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
                return Promise.resolve(result);
            });
    }

    public static update(object: any) {
        this._log.debug("Call to update with object: %j", object);
        let result: any;
        return this.validate(object)
            .then(() => {
                const role: RoleEntity = new RoleEntity(
                    object.name,
                    object.description,
                    object.enabled,
                    object.isRoot,
                    object.idParentRole
                );
                role.id = object.id;
                return Persistence.roleDao.update(role);
            })
            .then(() => {
                return Persistence.rolePermissionBitDao.deleteAllByIdRole(object.id);
            })
            .then((updatedRole: RoleEntity) => {
                result = updatedRole;
                let idsPermissionBits = _.map(object.permissionBits, (o: any) => {
                    return o.id;
                });
                idsPermissionBits = _.uniq(idsPermissionBits);
                const associationsToInsert: RolePermissionBitEntity[] = [];
                for (const id of idsPermissionBits) {
                    associationsToInsert.push(new RolePermissionBitEntity(
                        updatedRole.id,
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
                return Promise.resolve(result);
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
        let rolePermissionBits: RolePermissionBitEntity[];
        let permissionBits: PermissionBitEntity[];
        let authContexts: AuthContextEntity[];
        return Persistence.roleDao.findAll()
            .then((resultRoles) => {
                result = resultRoles;
                return Persistence.rolePermissionBitDao.findAll();
            })
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
                return Promise.resolve(result);
            });
    }

    private static _log = logger.getLogger("RoleService");

    private static prepareOneRecord(role: RoleEntity): Promise<any> {
        let result: any;
        result = role;
        return Persistence.rolePermissionBitDao.findAllByRoleId(role.id)
            .then((resultRolePermissionBits: RolePermissionBitEntity[]) => {
                const permissionBitIds = resultRolePermissionBits.map((value) => value.idPermissionBit);
                return this.populateData(permissionBitIds);
            })
            .then((resultData) => {
                result.permissionBits = resultData;
                return Promise.resolve(result);
            });
    }

    private static  validate(object: any): Promise<any> {
        this._log.debug("Call to validate");
        let errors: ValidationError[];
        const role: RoleEntity = new RoleEntity(
            object.name,
            object.description,
            object.enabled,
            object.isRoot,
            object.idParentRole
        );
        errors = RoleValidator.validateRole(role);
        const permissionBits = object.permissionBits;
        if (_.isArray(permissionBits) === false || permissionBits.length === 0) {
            // Rejecting early in order to avoid runtime errors.
            return Promise.reject([
                new ValidationError(this.ROLE_PERMISSION_BIT,
                    this.ROLE_PERMISSION_BITS_EMPTY,
                    "")
            ]);
        }
        if (errors.length > 0) {
            return Promise.reject(errors);
        } else {
            let idPermissionBits = _.map(permissionBits, (o: any) => o.id);
            idPermissionBits = _.uniq(idPermissionBits);
            return this.validatePermissionBitsIds(idPermissionBits);
        }
    }

    private static validatePermissionBitsIds(ids: string[]): Promise<any> {
        return Persistence.permissionBitDao.findAllByIds(ids)
            .then((resultQuery: PermissionBitEntity[]) => {
                if (resultQuery.length !== ids.length) {
                    this._log.warn("Someone was trying to insert role-permission with an invalid permission bit id");
                    return Promise.reject([new ValidationError(
                        this.ROLE_PERMISSION_BIT, this.PERMISSION_BIT_NOT_IN_DATABASE,
                        ""
                    )]);
                } else {
                    return Promise.resolve();
                }
            });
    }

    private static populateData(permissionBitIds: string[]): Promise<any> {
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
