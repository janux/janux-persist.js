/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
import {EntityPropertiesImpl} from "../../../index";
import {AccountDao} from "../account-dao";
import {AccountEntity} from "../account-entity";
import Promise = require("bluebird");
import {ValidationErrorImpl} from "../../../persistence/implementations/dao/validation-error";
import {MongooseAdapter} from "../../../persistence/implementations/db-adapters/mongoose-db-adapter";
import {AccountValidator} from "../account-validator";

/**
 * AccountDao implementation for the mongoose library.
 */
export class AccountDaoMongooseImpl extends AccountDao {

    constructor(dbEngineUtil: MongooseAdapter, entityProperties: EntityPropertiesImpl) {
        super(dbEngineUtil, entityProperties);
    }

    /**
     * Find all the users whose user name matches.
     * @param username The username to match.
     * @return {Promise<AccountEntity[]>} The parties whose username matches. If no record is founded then the method
     * returns an empty array.
     */
    public findByUserNameMatch(username: string): Promise<AccountEntity[]> {
        const regexpUsername = new RegExp(username, "i");
        const query = {
            username: regexpUsername
        };
        return this.findByQuery(query);
    }

    /**
     * Validate the object before inserting to the database.
     * In this case the method validates for duplicated usernames.
     * @param objectToInsert The object to validate.
     * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
     */
    protected validateBeforeInsert(objectToInsert: AccountEntity): Promise<ValidationErrorImpl[]> {
        const query = {
            $or: [
                {username: {$eq: objectToInsert.username}},
                {contactId: {$eq: objectToInsert.contactId}}
            ]
        };
        return this.findByQuery(query)
            .then((result) => {
                return Promise.resolve(AccountValidator.validateResultQueryBeforeBdOperation(result, objectToInsert));
            });
    }

    /**
     * Validate the object before updating to the database.
     * In this case the method validates for duplicated usernames.
     * @param objectToUpdate The object to update.
     * @return {Promise<ValidationErrorImpl[]>} A list of validation errors.
     */
    protected validateBeforeUpdate(objectToUpdate: AccountEntity): Promise<ValidationErrorImpl[]> {
        const query = {
            $and: [
                {_id: {$ne: objectToUpdate.id}},
                {
                    $or: [
                        {username: {$eq: objectToUpdate.username}},
                        {contactId: {$eq: objectToUpdate.contactId}}
                    ]
                }
            ]
        };
        return this.findByQuery(query)
            .then((result: AccountEntity[]) => {
                return Promise.resolve(AccountValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
            });
    }
}
