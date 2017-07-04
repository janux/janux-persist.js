/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */

import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {AccountRoleEntity} from "./account-role-entity";
import Promise = require("bluebird");
import {AttributeFilter} from "../../persistence/impl/attribute-filter";
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {AccountRoleValidator} from "./account-role-validator";

export class AccountRoleDao extends AbstractDataAccessObjectWithEngine<AccountRoleEntity> {

    private dbEngineLocal: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.dbEngineLocal = dbEngineUtil;
    }

    public findAllByAccountId(idAccount: string): Promise<AccountRoleEntity[]> {
        return this.dbEngineLocal.findAllByAttribute("idAccount", idAccount);
    }

    public findAllByRoleIdsIn(idsRole: string[]): Promise<AccountRoleEntity[]> {
        return this.dbEngineLocal.findAllByAttributeNameIn("idRole", idsRole);
    }

    public findAllByRoleId(idRole: string): Promise<AccountRoleEntity[]> {
        return this.dbEngineLocal.findAllByAttribute("idRole", idRole);
    }

    public findAllByAccountIdAndRoleId(idAccount: string, idRole: string): Promise<AccountRoleEntity[]> {
        const filter: AttributeFilter[] = [
            new AttributeFilter("idAccount", idAccount),
            new AttributeFilter("idRole", idRole)
        ];
        return this.dbEngineLocal.findAllByAttributesAndOperator(filter);
    }

    public deleteAllByIdAccount(idAccount: string) {
        return this.findAllByAccountId(idAccount)
            .then((records: AccountRoleEntity[]) => {
                const ids = records.map((value) => value.id);
                return this.dbEngineLocal.deleteAllByIds(ids);
            });
    }

    protected validateEntity<t>(objectToValidate: AccountRoleEntity): IValidationError[] {
        return AccountRoleValidator.validatedAccountRole(objectToValidate);
    }

    protected validateBeforeInsert<t>(objectToInsert: AccountRoleEntity): Promise<IValidationError[]> {
        return this.findAllByAccountIdAndRoleId(objectToInsert.idAccount, objectToInsert.idRole)
            .then((result: AccountRoleEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError("accountRole", "There is another record with the same IDs", ""));
                }
                return Promise.resolve(errors);
            });
    }

    protected validateBeforeUpdate<t>(objectToUpdate: AccountRoleEntity): Promise<IValidationError[]> {
        return Promise.resolve([new ValidationError(
            "accountRole",
            "You can't update, only insert or delete",
            "")]);
    }
}
