/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */

import * as Promise from "bluebird";
import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {AttributeFilter} from "../../persistence/impl/attribute-filter";
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {RolePermissionBitEntity} from "./role-permission-bit-entity";
import {RolePermissionBitValidator} from "./role-permission-bit-validator";

export class RolePermissionDao extends AbstractDataAccessObjectWithEngine<RolePermissionBitEntity> {

    private dbEngineUtilLocal: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.dbEngineUtilLocal = dbEngineUtil;
    }

    public findAllByRoleId(roleId: string): Promise<RolePermissionBitEntity[]> {
        return this.dbEngineUtilLocal.findAllByAttribute("idRole", roleId);
    }

    public findAllByPermissionBitId(idPermissionBit: string): Promise<RolePermissionBitEntity[]> {
        return this.dbEngineUtilLocal.findAllByAttribute("idPermissionBit", idPermissionBit);
    }

    public findAllByRoleIdsIn(roleIds: string[]): Promise<RolePermissionBitEntity[]> {
        return this.dbEngineUtilLocal.findAllByAttributeNameIn("idRole", roleIds);
    }

    public findAllByPermissionBitIdsIn(permissionBitIds: string[]): Promise<RolePermissionBitEntity[]> {
        return this.dbEngineUtilLocal.findAllByAttributeNameIn("idPermissionBit", permissionBitIds);
    }

    protected validateEntity(objectToValidate: RolePermissionBitEntity): IValidationError[] {
        return RolePermissionBitValidator.validateRolePermissionBit(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: RolePermissionBitEntity): Promise<IValidationError[]> {
        const filter: AttributeFilter[] = [
            new AttributeFilter("idRole", objectToInsert.idRole),
            new AttributeFilter("idPermissionBit", objectToInsert.idPermissionBit),
        ];
        return this.dbEngineUtilLocal.findAllByAttributesAndOperator(filter)
            .then((result) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError("RolePermissionBitEntity", "There is a record with the same IDs", ""));
                }
                return Promise.resolve(errors);
            });
    }

    protected validateBeforeUpdate(objectToUpdate: RolePermissionBitEntity): Promise<IValidationError[]> {
        const error = [new ValidationError(
            "rolePermissionDao",
            "You can't update a record of rolePermissionDao, only update or insert",
            "")];
        return Promise.resolve(error);
    }
}
