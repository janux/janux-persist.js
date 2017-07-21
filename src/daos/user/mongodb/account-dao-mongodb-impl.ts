/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
import {IEntityProperties} from "../../../index";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {AccountDao} from "../account-dao";
import {AccountEntity} from "../account-entity";
import Promise = require("bluebird");
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {AccountValidator} from "../account-valdiator";

/**
 * AccountDao implementation for the mongodb database.
 */
export class AccountDaoMongodbImpl extends AccountDao {

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    /**
     * Find all the users whose user name matches.
     * @param username The username to match.
     * @return {Promise<AccountEntity[]>} The parties whose username matches. If no record is founded then the method
     * returns an empty array.
     */
    public findAllByUserNameMatch(username: string): Promise<AccountEntity[]> {
        const regexpUsername = new RegExp(username, "i");
        const query = {
            username: regexpUsername
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
        return this.findAllByQuery(query)
            .then((result: AccountEntity[]) => {
                return Promise.resolve(AccountValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
            });
    }
}
