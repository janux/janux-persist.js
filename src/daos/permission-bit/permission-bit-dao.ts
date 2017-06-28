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
import {PermissionBitEntity} from "./permission-bit-entity";
import {PermissionBitValidator} from "./permission-bit-validator";

export abstract class PermissionBitDao extends AbstractDataAccessObjectWithEngine<PermissionBitEntity> {

    private dbEngineUtilLocal: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.dbEngineUtilLocal = dbEngineUtil;
    }

    public findAllByIdAuthContext(idAuthContext: string): Promise<PermissionBitEntity[]> {
        return this.dbEngineUtilLocal.findAllByAttribute("idAuthContext", idAuthContext);
    }

    // TODO: add test.
    public findAllByIdAuthContextsIn(idsAuthContext: string[]): Promise<PermissionBitEntity[]> {
        return this.dbEngineUtilLocal.findAllByAttributeNameIn("idAuthContext", idsAuthContext);
    }

    protected validateEntity<t>(objectToValidate: PermissionBitEntity): IValidationError[] {
        return PermissionBitValidator.validatePermissionBit(objectToValidate);
    }

    protected  validateBeforeInsert<t>(objectToInsert: PermissionBitEntity): Promise<IValidationError[]> {
        const filter: AttributeFilter[] = [
            new AttributeFilter("name", objectToInsert.name),
            new AttributeFilter("idAuthContext", objectToInsert.idAuthContext)
        ];
        return this.dbEngineUtilLocal.findAllByAttributesAndOperator(filter)
            .then((resultQuery) => {
                const errors: ValidationError[] = [];
                if (resultQuery.length > 0) {
                    errors.push(new ValidationError(
                        "name",
                        "There is a permission bit with the same name and the same auth context.",
                        objectToInsert.name));
                }
                return Promise.resolve(errors);
            });
    }

    protected abstract validateBeforeUpdate<t>(objectToUpdate: PermissionBitEntity): Promise<IValidationError[]>;
}
