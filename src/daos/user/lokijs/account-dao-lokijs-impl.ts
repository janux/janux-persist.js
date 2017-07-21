/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import * as _ from "lodash";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {AccountDao} from "../account-dao";
import Promise = require("bluebird");
import {LokiJsRepository} from "../../../persistence/impl/lokijs-repository";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {AccountEntity} from "../account-entity";
import {AccountValidator} from "../account-valdiator";

/**
 * AccountDao implementation for the mongodb database.
 */
export class AccountDaoLokiJsImpl extends AccountDao {

    constructor(dbEngineUtil: LokiJsRepository, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    /**
     * Find all the users whose user name matches.
     * @param username The username to match.
     * @return {Promise<AccountEntity[]>} The parties whose username matches. If no record is founded then the method
     * returns an empty array.
     */
    public findAllByUserNameMatch(username: string): Promise<AccountEntity[]> {
        const query = {
            username: {$contains: username},
        };
        return this.findAllByQuery(query);
    }

    /**
     * Validate the object before inserting to the database.
     * In this case the method validates for duplicated usernames.
     * @param objectToInsert The object to validate.
     * @return {Promise<IValidationError[]>} A list of validation errors.
     */
    protected validateBeforeInsert(objectToInsert: AccountEntity): Promise<IValidationError[]> {
        const query = {
            $or: [
                {username: {$eq: objectToInsert.username}},
                {contactId: {$eq: objectToInsert.contactId}}
            ]
        };
        return this.findAllByQuery(query)
            .then((result) => {
                return Promise.resolve(AccountValidator.validateResultQueryBeforeBdOperation(result, objectToInsert));
            });
    }

    /**
     * Validate the object before updating to the database.
     * In this case the method validates for duplicated usernames.
     * @param objectToUpdate The object to update.
     * @return {Promise<ValidationError[]>} A list of validation errors.
     */
    protected validateBeforeUpdate(objectToUpdate: AccountEntity): Promise<IValidationError[]> {
        const idValue = _.toNumber(objectToUpdate.id);
        const query = {
            $and: [
                {$loki: {$ne: idValue}},
                {
                    $or: [
                        {username: {$eq: objectToUpdate.username}},
                        {contactId: {$eq: objectToUpdate.contactId}}
                    ]
                }
            ]
        };
        return this.findAllByQuery(query)
            .then((result: AccountEntity[]) => {
                return Promise.resolve(AccountValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
            });
    }
}
