/**
 * Project janux-persistence
 * Created by ernesto on 6/26/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import * as logger from 'log4js';
import {AuthContextEntity} from "../../daos/auth-context/auth-context-entity";
import {AuthContextValidator} from "../../daos/auth-context/auth-context-validator";
import {DisplayNameEntity} from "../../daos/display-name/display-name-entity";
import {PermissionBitEntity} from "../../daos/permission-bit/permission-bit-entity";
import {PermissionBitValidator} from "../../daos/permission-bit/permission-bit-validator";
import {Persistence} from "../../daos/persistence";
import {RolePermissionBitEntity} from "../../daos/role-permission-bit/role-permission-bit-entity";
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";

export class AuthContextService {

    public static PERMISSION_BITS = "permissionBit.name";
    public static PERMISSION_BIT_DUPLICATED = "There are permission bits with duplicated names";
    public static PERMISSION_BITS_EMPTY = "There are not permission bits defined";
    public static PERMISSION_BIT_ASSOCIATED = "The permission bits you are going to delete has a role relation";
    public static ID_DISPLAY_NAME = "idDisplayName";
    public static ID_DISPLAY_NAME_DOES_NOT_EXIST = "idDisplayName does not exits in the database";
    public static AUTH_CONTEXT = "authContext";
    public static AUTH_CONTEXT_NOT_IN_DATABASE = "There is no auth context with this id";
    public static AUTH_CONTEXT_INVALID_ID = "Invalid id";
    public static AUTH_CONTEXT_LINKED_TO_ROLE = "This auth context has permission bits associated with roles";

    /**
     * Insert a new auth context with their permission bits.
     * @param objectToInsert
     */
    public static  insert(objectToInsert: any): Promise<any> {
        this._log.debug("Call to insert with objectToInsert: %j", objectToInsert);
        let authContextEntity: AuthContextEntity;
        let permissionBits: PermissionBitEntity[];
        let result: any;
        return this.validate(objectToInsert)
            .then((result: any) => {
                authContextEntity = result.authContextEntity;
                permissionBits = result.permissionBits;
                return Persistence.authContextDao.insert(authContextEntity);
            })
            .then((insertedRecord: AuthContextEntity) => {
                authContextEntity = insertedRecord;
                for (const bit of permissionBits) {
                    bit.idAuthContext = insertedRecord.id;
                }
                return Persistence.permissionBitDao.insertMany(permissionBits);
            })
            .then((insertedPermissionBits: PermissionBitEntity[]) => {
                result = authContextEntity;
                result.permissionBits = insertedPermissionBits;
                this._log.debug("Returning %j", result);
                return Promise.resolve(result);
            });
    }

    /**
     * Update an auth context and their permission bits.
     * @param objectToToUpdate
     */
    public static update(objectToToUpdate: any): Promise<any> {
        this._log.debug("Call to update with objectToToUpdate %j", objectToToUpdate);
        let authContextEntity: AuthContextEntity;
        let permissionBits: PermissionBitEntity[];
        let resultUpdate: any;
        return this.validate(objectToToUpdate)
            .then((result: any) => {
                authContextEntity = result.authContextEntity;
                permissionBits = result.permissionBits;
                return this.validatePermissionBitsUpdate(authContextEntity, permissionBits);
            })
            .then((idsToDelete: string[]) => {
                return Persistence.permissionBitDao.deleteAllByIds(idsToDelete);
            })
            .then(() => {
                // Update the auth context data
                return Persistence.authContextDao.update(authContextEntity);
            })
            .then((resultUpdateAuthContest: AuthContextEntity) => {
                resultUpdate = resultUpdateAuthContest;
                // Update or insert permission bits.
                return Promise.map(permissionBits, (element) => {
                    if (isBlankString(element.idAuthContext)) {
                        element.idAuthContext = objectToToUpdate.id;
                    }
                    return Persistence.permissionBitDao.updateOrInsert(element);
                });
            })
            .then((resultUpdateOrInserts: PermissionBitEntity[]) => {
                // All set. Returning the updated and inserted records.
                resultUpdate.permissionBits = resultUpdateOrInserts;
                this._log.debug("Returning %j", resultUpdate);
                return Promise.resolve(resultUpdate);
            });
    }

    public static remove(idAuthContext: string) {
        let authContextToDelete: AuthContextEntity;
        let permissionBitsIdsToDelete: string[];
        if (isBlankString(idAuthContext)) {
            return Promise.reject([
                new ValidationError(this.AUTH_CONTEXT, this.AUTH_CONTEXT_INVALID_ID, idAuthContext)
            ]);
        }
        return Persistence.authContextDao.findOneById(idAuthContext)
            .then((auth: AuthContextEntity) => {
                if (auth == null) {
                    this._log.warn("Someone was trying to delete an auth context with an invalid id: %j", idAuthContext);
                    return Promise.reject([
                        new ValidationError(this.AUTH_CONTEXT, this.AUTH_CONTEXT_NOT_IN_DATABASE, idAuthContext)
                    ]);
                } else {
                    authContextToDelete = auth;
                    return Persistence.permissionBitDao.findAllByIdAuthContext(authContextToDelete.id);
                }
            })
            .then((permissionBits: PermissionBitEntity[]) => {
                permissionBitsIdsToDelete = permissionBits.map((value) => value.id);
                return Persistence.rolePermissionBitDao.findAllByPermissionBitIdsIn(permissionBitsIdsToDelete);
            })
            .then((rolePermissionBits: RolePermissionBitEntity[]) => {
                if (rolePermissionBits.length > 0) {
                    this._log.warn("Someone was trying to delete an auth linked to a role: %j", idAuthContext);
                    return Promise.reject([
                        new ValidationError(this.AUTH_CONTEXT, this.AUTH_CONTEXT_LINKED_TO_ROLE, idAuthContext)
                    ]);
                } else {
                    return Persistence.permissionBitDao.deleteAllByIds(permissionBitsIdsToDelete);
                }
            })
            .then(() => {
                return Persistence.authContextDao.remove(authContextToDelete);
            });
    }

    /**
     * Find one auth context and attach their permission bits.
     * @param id
     * @return {Bluebird<any>} The auth context.
     */
    public static findOneById(id: string): Promise<any> {
        this._log.debug("Call to findOneById with id: %j", id);
        let result: any;
        return Persistence.authContextDao.findOneById(id)
            .then((value: AuthContextEntity) => {
                if (value === null) {
                    return Promise.resolve(null);
                }
                result = value as any;
                return Persistence.permissionBitDao.findAllByIdAuthContext(value.id);
            })
            .then((resultQuery: PermissionBitEntity[]) => {
                result.permissionBits = resultQuery;
                return Promise.resolve(result);
            });
    }

    /**
     * Find all auth context and attach their permission bits.
     * @return {Bluebird<any[]>} The auth contexts.
     */
    public static findAll(): Promise<any[]> {
        this._log.debug("Call to findAll");
        let result: any[];
        return Persistence.authContextDao.findAll()
            .then((resultQuery: AuthContextEntity[]) => {
                result = resultQuery;
                return Persistence.permissionBitDao.findAll();
            })
            .then((resultQueryPermissions: PermissionBitEntity[]) => {
                for (const auth of result) {
                    auth.permissionBits = _.filter(resultQueryPermissions, (o) => {
                        return o.idAuthContext === auth.id;
                    });
                }
                return Promise.resolve(result);
            });
    }

    public static findAllByIdDisplayName(idDisplayName: string) {
        this._log.debug("Call to findAllByIdDisplayName with idDisplayName:%j", idDisplayName);
        let result: any;
        return Persistence.authContextDao.findAllByIdDisplayName(idDisplayName)
            .then((resultQuery: AuthContextEntity[]) => {
                result = resultQuery;
                const ids = resultQuery.map((value, index, array) => value.id);
                return Persistence.permissionBitDao.findAllByIdAuthContextsIn(ids);
            })
            .then((resultQueryPermissions: PermissionBitEntity[]) => {
                for (const auth of result) {
                    auth.permissionBits = _.filter(resultQueryPermissions, (o) => {
                        return o.idAuthContext === auth.id;
                    });
                }
                return Promise.resolve(result);
            });
    }

    private static _log = logger.getLogger("AuthContextService");

    /**
     * Validate the data before insert or update.
     * @param object The object to be validated.
     * @return {any} A promise with the data to insert or update or an array of ValidationError indicating an error.
     */
    private static validate(object: any): Promise<any> {
        this._log.debug("Call to validate with object %j", object);
        const permissionBits: PermissionBitEntity[] = [];
        const authContextEntity = new AuthContextEntity(
            object.name,
            object.description,
            object.sortOrder,
            object.enabled,
            object.idDisplayName
        );
        authContextEntity.id = object.id;
        const errors = AuthContextValidator.validateAuthContext(authContextEntity);
        if (errors.length > 0) {
            return Promise.reject(errors);
        }
        return this.validatePermissionBits(object)
            .then(() => {
                return Persistence.displayNameDao.findOneById(authContextEntity.idDisplayName);
    })
            .then((resultQuery: DisplayNameEntity) => {
                if (resultQuery === null) {
                    this._log.warn("idDisplayName %j does not exist in the database", authContextEntity.idDisplayName);
                    return Promise.reject([
                        new ValidationError(
                            this.ID_DISPLAY_NAME,
                            this.ID_DISPLAY_NAME_DOES_NOT_EXIST,
                            authContextEntity.idDisplayName)
                    ]);
                } else {
                    for (const bit of object.permissionBits) {
                        const permissionBit: PermissionBitEntity = new PermissionBitEntity(
                            bit.name,
                            bit.description,
                            bit.position,
                            ""
                        );
                        permissionBit.id = bit.id;
                        permissionBits.push(permissionBit);
                    }
                    // Everything is correct, return the records to insert.
                    return Promise.resolve({
                        authContextEntity,
                        permissionBits
                    });
                }
            });
    }

    /**
     * Validate the permission bits before insert or update.
     * @param object
     * @return {any}
     */
    private static validatePermissionBits(object: any): Promise<any> {
        const permissionBits = object.permissionBits;
        let errors: ValidationError[] = [];
        // Check if there are permission bits.
        if (_.isArray(object.permissionBits) === false || object.permissionBits.length === 0) {
            this._log.warn("permissionBits is not an array or is empty");
            errors.push(new ValidationError(this.PERMISSION_BITS, this.PERMISSION_BITS_EMPTY, ""));
            // Returning here because the array is undefined or null.
            return Promise.reject(errors);
        }

        // Check if each permission bit is valid
        for (const bit of object.permissionBits) {
            errors = errors.concat(PermissionBitValidator.validatePermissionBitWithNoIdAuthContext(bit));
        }

        // Check if there are no duplicated permission bits.
        const names: string[] = permissionBits.map((value, index, array) => value.name);
        const uniqueNames: string[] = _.uniq(names);
        if (uniqueNames.length !== names.length && uniqueNames.length > 0) {
            this._log.warn("There are permission bits with the same name.");
            errors.push(new ValidationError(this.PERMISSION_BITS, this.PERMISSION_BIT_DUPLICATED, ""));
        }

        if (errors.length > 0) {
            return Promise.reject(errors);
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Validate the records before update
     * @param authContextEntity The auth context.
     * @param permissionBits the permission bits.
     * @return {Bluebird<Array>} Return a promise indicating the permission bits that are going to be removed.
     */
    private static validatePermissionBitsUpdate(authContextEntity: AuthContextEntity, permissionBits: PermissionBitEntity[]): Promise<any> {
        this._log.debug(
            "Call to validatePermissionBitsUpdate with authContextEntity: %j,permissionBits: %j",
            authContextEntity,
            permissionBits);
        const idsToPreserve: string[] = permissionBits
            .filter((value, index, array) => isBlankString(value.id) === false)
            .map((value, index, array) => value.id);

        // Look for the permission bits that are going to be deleted.
        // Find current permission bits.
        return Persistence.permissionBitDao.findAllByIdAuthContext(authContextEntity.id)
            .then((currentPermissionBits: PermissionBitEntity[]) => {
                const existingIds: string[] = currentPermissionBits.map((value, index, array) => value.id);
                const idsToDelete: string[] = _.xor(idsToPreserve, existingIds);
                this._log.debug("Validating idsToDelete %j", idsToDelete);
                // Validate if one of the permission bits that are going to be removed.
                // has a relation with roles.
                return Persistence.rolePermissionBitDao.findAllByPermissionBitIdsIn(idsToDelete)
                    .then((rolesPermissionBits: RolePermissionBitEntity[]) => {
                        if (rolesPermissionBits.length > 0) {
                            this._log.warn("Someone in trying to delete a permission bit associated with a role:\nExisting records:\n%j", rolesPermissionBits);
                            return Promise.reject([
                                new ValidationError(
                                    this.PERMISSION_BITS,
                                    this.PERMISSION_BIT_ASSOCIATED,
                                    JSON.stringify(rolesPermissionBits)
                                )
                            ]);
                        } else {
                            return Promise.resolve(idsToDelete);
                        }
                    });
            });
    }
}
