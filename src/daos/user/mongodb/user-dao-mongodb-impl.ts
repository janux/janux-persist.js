/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
import {IEntityProperties} from "../../../index";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {UserDao} from "../user-dao";
import {UserEntity} from "../user-entity";
import Promise = require("bluebird");
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {UserValidator} from "../user-valdiator";

/**
 * UserDao implementation for the mongodb database.
 */
export class UserDaoMongodbImpl extends UserDao {

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    /**
     * Find all the users whose user name matches.
     * @param username The username to match.
     * @return {Promise<UserEntity[]>} The parties whose username matches. If no record is founded then the method
     * returns an empty array.
     */
    public findAllByUserNameMatch(username: string): Promise<UserEntity[]> {
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
     * @return {Bluebird<IValidationError[]>} A list of validation errors.
     */
    protected validateBeforeInsert(objectToInsert: UserEntity): Promise<IValidationError[]> {
        const query = {
            $or: [
                {username: {$eq: objectToInsert.username}},
                {contactId: {$eq: objectToInsert.contactId}}
            ]
        };
        return this.findAllByQuery(query)
            .then((result) => {
                return Promise.resolve(UserValidator.validateResultQueryBeforeBdOperation(result, objectToInsert));
            });
    }

    /**
     * Validate the object before updating to the database.
     * In this case the method validates for duplicated usernames.
     * @param objectToUpdate The object to update.
     * @return {Bluebird<ValidationError[]>} A list of validation errors.
     */
    protected validateBeforeUpdate(objectToUpdate: UserEntity): Promise<IValidationError[]> {
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
            .then((result: UserEntity[]) => {
                return Promise.resolve(UserValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
            });
    }
}
