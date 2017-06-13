/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {AccountDao} from "../account-dao";
import Promise = require("bluebird");
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {Account} from "../account";
import {AccountValidator} from "../accout-valdiator";

export class AccountDaoLokiJsImpl extends AccountDao {

    private lokijsCollection;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.lokijsCollection = dbEngineUtil.collection;
    }

    protected validateBeforeInsert(objectToInsert: Account): Promise<IValidationError[]> {
        const query = {
            username: objectToInsert.username
        };

        return LokiJsUtil.findAllByQuery(this.lokijsCollection, query)
            .then((result) => {
                return Promise.resolve(AccountValidator.validateBeforeInsertQueryResult(result, objectToInsert));
            });
    }

    protected validateBeforeUpdate(objectToUpdate: Account): Promise<IValidationError[]> {
        const id = "id";
        const query = {
            $and: [
                {$loki: {$ne: objectToUpdate[id]}},
                {username: {$eq: objectToUpdate.username}}
            ]
        };
        return LokiJsUtil.findAllByQuery(this.lokijsCollection, query)
            .then((result: Account[]) => {
                return Promise.resolve(AccountValidator.validateBeforeInsertQueryResult(result, objectToUpdate));
            });
    }
}
