/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */

import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {UserRoleEntity} from "./user-role-entity";
import Promise = require("bluebird");
import {AttributeFilter} from "../../persistence/impl/attribute-filter";
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {UserRoleValidator} from "./user-role-validator";

export class UserRoleDao extends AbstractDataAccessObjectWithEngine<UserRoleEntity> {

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    public findAllByAccountId(idAccount: string): Promise<UserRoleEntity[]> {
        return this.findAllByAttribute("idAccount", idAccount);
    }

    public findAllByRoleIdsIn(idsRole: string[]): Promise<UserRoleEntity[]> {
        return this.findAllByAttributeNameIn("idRole", idsRole);
    }

    public findAllByRoleId(idRole: string): Promise<UserRoleEntity[]> {
        return this.findAllByAttribute("idRole", idRole);
    }

    public findAllByAccountIdAndRoleId(idAccount: string, idRole: string): Promise<UserRoleEntity[]> {
        const filter: AttributeFilter[] = [
            new AttributeFilter("idAccount", idAccount),
            new AttributeFilter("idRole", idRole)
        ];
        return this.findAllByAttributesAndOperator(filter);
    }

    public deleteAllByIdAccount(idAccount: string) {
        return this.findAllByAccountId(idAccount)
            .then((records: UserRoleEntity[]) => {
                const ids = records.map((value) => value.id);
                return this.deleteAllByIds(ids);
            });
    }

    protected validateEntity(objectToValidate: UserRoleEntity): IValidationError[] {
        return UserRoleValidator.validateUserRole(objectToValidate);
    }

    protected validateBeforeInsert<t>(objectToInsert: UserRoleEntity): Promise<IValidationError[]> {
        return this.findAllByAccountIdAndRoleId(objectToInsert.idAccount, objectToInsert.idRole)
            .then((result: UserRoleEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError("accountRole", "There is another record with the same IDs", ""));
                }
                return Promise.resolve(errors);
            });
    }

    protected validateBeforeUpdate<t>(objectToUpdate: UserRoleEntity): Promise<IValidationError[]> {
        return Promise.resolve([new ValidationError(
            "accountRole",
            "You can't update, only insert or delete",
            "")]);
    }
}
