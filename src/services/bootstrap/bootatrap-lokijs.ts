/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as logger from 'log4js';
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
import {UserRoleDao} from "../../daos/user-role/user-role-dao";
import {UserDaoLokiJsImpl} from "../../daos/user/lokijs/user-dao-lokijs-impl";
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
        Persistence.userDao = new UserDaoLokiJsImpl(
            new DbEngineUtilLokijs("user", loki),
            new EntityProperties(false, true)
        );

        // Account role
        Persistence.userRoleDao = new UserRoleDao(
            new DbEngineUtilLokijs("accountRole", loki),
            new EntityProperties(false, true)
        );

        // Auth context
        Persistence.authContextDao = new AuthContextLokijsImpl(
            new DbEngineUtilLokijs("authorization-context", loki),
            new EntityProperties(false, true)
        );

        // Permission bit
        Persistence.permissionBitDao = new PermissionBitLokijsImpl(
            new DbEngineUtilLokijs("permission-bit", loki),
            new EntityProperties(false, true)
        );

        // Role dao
        Persistence.roleDao = new RoleDaoLokiJsImpl(
            new DbEngineUtilLokijs("role", loki),
            new EntityProperties(false, true)
        );

        // Role permission bit
        Persistence.rolePermissionBitDao = new RolePermissionDao(
            new DbEngineUtilLokijs("role-permission-bit", loki),
            new EntityProperties(false, true)
        );

        // Country
        Persistence.countryDao = new CountryDaoLokiJsImpl(
            new DbEngineUtilLokijs("country", loki), null
        );

        // State province
        Persistence.stateProvinceDao = new StateProvinceDaoLokiJsImpl(
            new DbEngineUtilLokijs("state-province", loki), null
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
