/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {UserEntity} from "./user-entity";
import Promise = require("bluebird");
import {UserValidator} from "./user-valdiator";

export abstract class UserDao extends AbstractDataAccessObjectWithEngine<UserEntity> {

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    public abstract findAllByUserNameMatch(username: string): Promise<UserEntity[]>;

    public findOneByUserName(username: string): Promise<UserEntity> {
        return this.findOneByAttribute("username", username);
    }

    public findOneByUserId(userId: string): Promise<UserEntity> {
        return this.findOneByAttribute("userId", userId);
    }

    public findOneByContactId(contactId: string) {
        return this.findOneByAttribute("contactId", contactId);
    }

    public findAllByContactIdsIn(contactIds: string[]): Promise<UserEntity[]> {
        return this.findAllByAttributeNameIn("contactId", contactIds);
    }

    protected  validateEntity(objectToValidate: UserEntity): IValidationError[] {
        return UserValidator.validateAccount(objectToValidate);
    }

    protected abstract validateBeforeInsert(objectToInsert: UserEntity): Promise<IValidationError[]>;

    protected abstract validateBeforeUpdate(objectToUpdate: UserEntity): Promise<IValidationError[]>;

}
