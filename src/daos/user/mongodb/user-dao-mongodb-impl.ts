/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
import {IEntityProperties} from "../../../index";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {UserDao} from "../user-dao";
import {UserEntity} from "../user-entity";
import Promise = require("bluebird");
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {MongoDbUtil} from "../../../persistence/util/mongodb-util.js";
import {UserValidator} from "../user-valdiator";

export class UserDaoMongodbImpl extends UserDao {
    model: Model<any>;

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    public findAllByUserNameMatch(username: string): Promise<UserEntity[]> {
        const regexpUsername = new RegExp(username, "i");
        const query = {
            username: regexpUsername
        };
        return MongoDbUtil.findAllByQuery(this.model, query);
    }

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
        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((result: UserEntity[]) => {
                return Promise.resolve(UserValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
            });
    }
}
