/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {Account} from "./account";
import Promise = require("bluebird");
import {AccountValidator} from "./accout-valdiator";

export abstract class AccountDao extends AbstractDataAccessObjectWithEngine<Account> {

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    public findOneByUserName(username: string): Promise<Account> {
        return this.findOneByAttribute("username", username);
    }

    protected  validateEntity(objectToValidate: Account): IValidationError[] {
        return AccountValidator.validateAccount(objectToValidate);
    }

    protected abstract validateBeforeInsert(objectToInsert: Account): Promise<IValidationError[]>;

    protected abstract validateBeforeUpdate(objectToUpdate: Account): Promise<IValidationError[]>;

}
