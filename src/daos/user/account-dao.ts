/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {ICrudMethods} from "../../persistence/interfaces/crud-methods";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {AccountEntity} from "./account-entity";
import Promise = require("bluebird");
import {AccountValidator} from "./account-valdiator";

/**
 * User dao.
 */
export abstract class AccountDao extends AbstractDataAccessObjectWithEngine<AccountEntity> {

    constructor(dbEngineUtil: ICrudMethods, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    /**
     * Find all the users whose user name matches.
     * This is an abstract class because the query is implement in a different way for lokijs and
     * mongoose.
     * @param username The username to match.
     */
    public abstract findAllByUserNameMatch(username: string): Promise<AccountEntity[]>;

    /**
     * Find one user with the username.
     * @param username the username to look for.
     * @return {Promise<AccountEntity>} The user, if no record is founded then it return a null.
     */
    public findOneByUserName(username: string): Promise<AccountEntity> {
        return this.findOneByAttribute("username", username);
    }

    /**
     * Find one user whose attribute "userId" matches with the value.
     * @param userId The value to look for.
     * @return {Promise<AccountEntity>} The user, if no record is founded then it return a null.
     */
    public findOneByUserId(userId: string): Promise<AccountEntity> {
        return this.findOneByAttribute("userId", userId);
    }

    /**
     * Find one user whose attribute "contactId" matches with the value.
     * @param contactId The value to look for.
     * @return {Promise<AccountEntity>} The user, if no record is founded then it return a null.
     */
    public findOneByContactId(contactId: string) {
        return this.findOneByAttribute("contactId", contactId);
    }

    /**
     * Find all users whose "contactId" attribute matches with the values.
     * @param contactIds The values to look for.
     * @return {Promise<AccountEntity[]>} The users, if no record is founded then it return an empty array.
     */
    public findAllByContactIdsIn(contactIds: string[]): Promise<AccountEntity[]> {
        return this.findAllByAttributeNameIn("contactId", contactIds);
    }

    /**
     * Validate the entity before insert or update.
     * @param objectToValidate The object to validate.
     * @return {ValidationError[]} An array containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected  validateEntity(objectToValidate: AccountEntity): IValidationError[] {
        return AccountValidator.validateAccount(objectToValidate);
    }

    /**
     * Validate the object before insert it to the database.
     * Given the validation might involve complex queries. The method is marked as abstract in order to be
     * implemented by each extended class.
     * @param objectToInsert The object to validate.
     */
    protected abstract validateBeforeInsert(objectToInsert: AccountEntity): Promise<IValidationError[]>;

    /**
     * Validate the object before update it to the database.
     * Given the validation might involve complex queries. The method is marked as abstract in order to be
     * implemented by each extended class.
     * @param objectToUpdate
     */
    protected abstract validateBeforeUpdate(objectToUpdate: AccountEntity): Promise<IValidationError[]>;

}
