/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {AccountEntity} from "./account-entity";
import Promise = require("bluebird");
import {AccountValidator} from "./accout-valdiator";

export abstract class AccountDao extends AbstractDataAccessObjectWithEngine<AccountEntity> {

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    public findOneByUserName(username: string): Promise<AccountEntity> {
        return this.findOneByAttribute("username", username);
    }

    protected  validateEntity(objectToValidate: AccountEntity): IValidationError[] {
        return AccountValidator.validateAccount(objectToValidate);
    }

    protected abstract validateBeforeInsert(objectToInsert: AccountEntity): Promise<IValidationError[]>;

    protected abstract validateBeforeUpdate(objectToUpdate: AccountEntity): Promise<IValidationError[]>;

}
