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
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {UserEntity} from "../user-entity";
import {UserValidator} from "../user-valdiator";

export class UserDaoLokiJsImpl extends UserDao {

    private lokijsCollection;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.lokijsCollection = dbEngineUtil.collection;
    }

    public findAllByUserNameMatch(username: string): Promise<UserEntity[]> {
        const query = {
            username: {$contains: username},
        };
        return this.findAllByQuery(query);
    }

    protected validateBeforeInsert(objectToInsert: UserEntity): Promise<IValidationError[]> {
        const query = {
            $or: [
                {username: {$eq: objectToInsert.username}},
                {contactId: {$eq: objectToInsert.contactId}}
            ]
        };
        return LokiJsUtil.findAllByQuery(this.lokijsCollection, query)
            .then((result) => {
                return Promise.resolve(UserValidator.validateResultQueryBeforeBdOperation(result, objectToInsert));
            });
    }

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
        return LokiJsUtil.findAllByQuery(this.lokijsCollection, query)
            .then((result: UserEntity[]) => {
                return Promise.resolve(UserValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
            });
    }
}
