/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as logger from 'log4js';
import {PartyDaoLokiJsImpl} from "../../daos/party/lokijs/party-dao-loki-js-impl";
import {Persistence} from "../../daos/persistence";
import {AccountDaoLokiJsImpl} from "../../daos/user/lokijs/account-dao-lokijs-impl";
import {DbEngineUtilLokijs} from "../../persistence/impl/db-engine-util-lokijs";
import {EntityProperties} from "../../persistence/impl/entity-properties";

export class BootstrapLokiJsDaos {

    public static initLokiJsDaos(loki: any) {
        this._log.debug("Call to initLokiJsDaos");

        // Account dao
        Persistence.userDao = new AccountDaoLokiJsImpl(
            new DbEngineUtilLokijs("user", loki),
            new EntityProperties(false, true)
        );

        // Party
        Persistence.partyDao = new PartyDaoLokiJsImpl(
            new DbEngineUtilLokijs("party", loki),
            new EntityProperties(false, true)
        );
    }

    private static _log = logger.getLogger("BootstrapLokiJsDaos");
}
