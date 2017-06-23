/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {IPartyEntity} from "../iParty-entity";
import {PartyDao} from "../party-dao";

export class PartyDaoLokiJsImpl extends PartyDao {

    private collection: any;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.collection = dbEngineUtil.collection;
    }

    protected validateBeforeUpdate<t>(objectToUpdate: IPartyEntity): Promise<IValidationError[]> {
        return null;
    }
}
