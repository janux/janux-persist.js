/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import * as _ from "lodash";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {UserDao} from "../user-dao";
import Promise = require("bluebird");
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {UserEntity} from "../user-entity";
import {UserValidator} from "../user-valdiator";

/**
 * UserDao implementation for the mongodb database.
 */
export class UserDaoLokiJsImpl extends UserDao {

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    /**
     * Find all the users whose user name matches.
     * @param username The username to match.
     * @return {Promise<UserEntity[]>} The parties whose username matches. If no record is founded then the method
     * returns an empty array.
     */
    public findAllByUserNameMatch(username: string): Promise<UserEntity[]> {
        const query = {
            username: {$contains: username},
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
            .then((result: UserEntity[]) => {
                return Promise.resolve(UserValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
            });
    }
}
