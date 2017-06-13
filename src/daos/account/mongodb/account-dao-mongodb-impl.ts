/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
import {IEntityProperties} from "../../../index";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {Account} from "../account";
import {AccountDao} from "../account-dao";
import Promise = require("bluebird");
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {MongoDbUtil} from "../../../persistence/util/mongodb-util.js";
import {AccountValidator} from "../accout-valdiator";

export class AccountDaoMongodbImpl extends AccountDao {
    model: Model<any>;

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    protected validateBeforeInsert(objectToInsert: Account): Promise<IValidationError[]> {
        const query = {username: objectToInsert.username};
        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((result) => {
                return Promise.resolve(AccountValidator.validateBeforeInsertQueryResult(result, objectToInsert));
            });
    }

    protected validateBeforeUpdate(objectToUpdate: Account): Promise<IValidationError[]> {
        const id = 'id';
        const query = {
            $and: [
                {_id: {$ne: objectToUpdate[id]}},
                {username: {$eq: objectToUpdate.username}}
            ]
        };
        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((result: Account[]) => {
                return Promise.resolve(AccountValidator.validateBeforeInsertQueryResult(result, objectToUpdate));
            });
    }
}
