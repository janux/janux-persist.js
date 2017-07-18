/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as logger from 'log4js';
import {PartyDaoMongoDbImpl} from "../../daos/party/mongodb/party-dao-mongodb-impl";
import {PartyMongoDbSchema} from "../../daos/party/mongodb/party-mongodb-schema";
import {Persistence} from "../../daos/persistence";
import {AccountDaoMongodbImpl} from "../../daos/user/mongodb/account-dao-mongodb-impl";
import {AccountMongoDbSchema} from "../../daos/user/mongodb/account-mongodb-schema";
import {DbEngineUtilMongodb} from "../../persistence/impl/db-engine-util-mongodb";
import {EntityProperties} from "../../persistence/impl/entity-properties";

export class BootStrapMongoDbDaos {
    public static initMongoDbDaos(mongoose: any) {
        const persistence = Persistence;
        this._log.debug("Call to initMongoDbDaos");

        // Account dao
        persistence.userDao = new AccountDaoMongodbImpl(
            new DbEngineUtilMongodb(mongoose.model('user', AccountMongoDbSchema)),
            new EntityProperties(false, true));

        // Party
        persistence.partyDao = new PartyDaoMongoDbImpl(
            new DbEngineUtilMongodb(mongoose.model('party', PartyMongoDbSchema)),
            new EntityProperties(false, true)
        );
    }

    private static _log = logger.getLogger("BootStrapMongoDbDaos");
}
