/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Bluebird from "bluebird";
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {IPartyEntity} from "../iParty-entity";
import {PartyDao} from "../party-dao";

export class PartyDaoMongoDbImpl extends PartyDao {

    private model: Model<any>;
    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    protected validateBeforeUpdate(objectToUpdate: IPartyEntity): Bluebird<IValidationError[]> {
        return null;
    }
}
