/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as logger from 'log4js';
import {AccountRoleDao} from "../../daos/account-role/account-role-dao";
import {AccountDaoLokiJsImpl} from "../../daos/account/lokijs/account-dao-lokijs-impl";
import {AuthContextLokijsImpl} from "../../daos/auth-context/lokijs/auth-context-dao-lokijs-impl";
import {CityDaoLokiJsImpl} from "../../daos/city/lokijs/city-dao-lokijs-impl";
import {CountryDaoLokiJsImpl} from "../../daos/country/lokijs/country-dao-lokijs-impl";
import {DisplayNameDaoLokijsImpl} from "../../daos/display-name/lokijs/display-name-dao-lokijs-impl";
import {PartyDaoLokiJsImpl} from "../../daos/party/lokijs/party-dao-loki-js-impl";
import {PermissionBitLokijsImpl} from "../../daos/permission-bit/lokijs/permission-bit-lokijs-impl";
import {Persistence} from "../../daos/persistence";
import {RolePermissionDao} from "../../daos/role-permission-bit/role-permission-bit-dao";
import {RoleDaoLokiJsImpl} from "../../daos/role/lokijs/role-dao-lokijs-impl";
import {StateProvinceDaoLokiJsImpl} from "../../daos/state-province/lokijs/state-province-lokijs-impl";
import {DbEngineUtilLokijs} from "../../persistence/impl/db-engine-util-lokijs";
import {EntityProperties} from "../../persistence/impl/entity-properties";

export class BootstrapLokiJsDaos {

    public static initLokiJsDaos(loki: any) {
        this._log.debug("Call to initLokiJsDaos");

        // Display name
        Persistence.displayNameDao = new DisplayNameDaoLokijsImpl(
            new DbEngineUtilLokijs("displayName", loki), null
        );

        // Account dao
        Persistence.accountDao = new AccountDaoLokiJsImpl(
            new DbEngineUtilLokijs("account", loki),
            new EntityProperties(false, true)
        );

        // Account role
        Persistence.accountRoleDao = new AccountRoleDao(
            new DbEngineUtilLokijs("accountRole", loki),
            new EntityProperties(false, true)
        );

        // Auth context
        Persistence.authContextDao = new AuthContextLokijsImpl(
            new DbEngineUtilLokijs("authorizationContext", loki),
            new EntityProperties(false, true)
        );

        // Permission bit
        Persistence.permissionBitDao = new PermissionBitLokijsImpl(
            new DbEngineUtilLokijs("permissionBit", loki),
            new EntityProperties(false, true)
        );

        // Role dao
        Persistence.roleDao = new RoleDaoLokiJsImpl(
            new DbEngineUtilLokijs("role", loki),
            new EntityProperties(false, true)
        );

        // Role permission bit
        Persistence.rolePermissionBitDao = new RolePermissionDao(
            new DbEngineUtilLokijs("rolePermissionBit", loki),
            new EntityProperties(false, true)
        );

        // Country
        Persistence.countryDao = new CountryDaoLokiJsImpl(
            new DbEngineUtilLokijs("country", loki), null
        );

        // State province
        Persistence.stateProvinceDao = new StateProvinceDaoLokiJsImpl(
            new DbEngineUtilLokijs("stateProvince", loki), null
        );

        // City
        Persistence.cityDao = new CityDaoLokiJsImpl(
            new DbEngineUtilLokijs("city", loki), null
        );

        // Party
        Persistence.partyDao = new PartyDaoLokiJsImpl(
            new DbEngineUtilLokijs("party", loki),
            new EntityProperties(false, true)
        );

    }

    private static _log = logger.getLogger("BootstrapLokiJsDaos");
}
