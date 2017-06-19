/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import * as _ from "lodash";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {AccountDao} from "../account-dao";
import Promise = require("bluebird");
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {AccountEntity} from "../account-entity";
import {AccountValidator} from "../accout-valdiator";

export class AccountDaoLokiJsImpl extends AccountDao {

    private lokijsCollection;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.lokijsCollection = dbEngineUtil.collection;
    }

    protected validateBeforeInsert(objectToInsert: AccountEntity): Promise<IValidationError[]> {
        const query = {
            username: objectToInsert.username
        };

        return LokiJsUtil.findAllByQuery(this.lokijsCollection, query)
            .then((result) => {
                return Promise.resolve(AccountValidator.validateResultQueryBeforeBdOperation(result, objectToInsert));
            });
    }

    protected validateBeforeUpdate(objectToUpdate: AccountEntity): Promise<IValidationError[]> {
        const id = "id";
        const idValue = _.toNumber(objectToUpdate[id]);
        const query = {
            $and: [
                {$loki: {$ne: idValue}},
                {username: {$eq: objectToUpdate.username}}
            ]
        };
        return LokiJsUtil.findAllByQuery(this.lokijsCollection, query)
            .then((result: AccountEntity[]) => {
                return Promise.resolve(AccountValidator.validateResultQueryBeforeBdOperation(result, objectToUpdate));
            });
    }
}
