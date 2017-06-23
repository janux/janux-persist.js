/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as logger from 'log4js';
import {AccountRoleDao} from "../../daos/account-role/account-role-dao";
import {AccountDaoLokiJsImpl} from "../../daos/account/lokijs/account-dao-lokijs-impl";
import {AuthContextLokijsImpl} from "../../daos/auth-context/lokijs/auth-context-dao-lokijs-impl";
import {DisplayNameDaoLokijsImpl} from "../../daos/display-name/lokijs/display-name-dao-lokijs-impl";
import {PermissionBitLokijsImpl} from "../../daos/permission-bit/lokijs/permission-bit-lokijs-impl";
import {Persistence} from "../../daos/persistence";
import {RolePermissionDao} from "../../daos/role-permission-bit/role-permission-bit-dao";
import {RoleDaoLokiJsImpl} from "../../daos/role/lokijs/role-dao-lokijs-impl";
import {DbEngineUtilLokijs} from "../../persistence/impl/db-engine-util-lokijs";

export class BootstrapLokiJsDaos {

    public static initLokiJsDaos(loki: any) {
        this._log.debug("Call to initLokiJsDaos");

        // Display name
        Persistence.displayNameDao = new DisplayNameDaoLokijsImpl(
            new DbEngineUtilLokijs("displayName", loki), null
        );

        // Account dao
        Persistence.accountDao = new AccountDaoLokiJsImpl(
            new DbEngineUtilLokijs("account", loki), null
        );

        // Account role
        Persistence.accountRoleDao = new AccountRoleDao(
            new DbEngineUtilLokijs("accountRole", loki), null
        );

        // Auth context
        Persistence.authContextDao = new AuthContextLokijsImpl(
            new DbEngineUtilLokijs("authorizationContext", loki), null
        );

        // Permission bit
        Persistence.permissionBitDao = new PermissionBitLokijsImpl(
            new DbEngineUtilLokijs("permissionBit", loki), null
        );

        // Role dao
        Persistence.roleDao = new RoleDaoLokiJsImpl(
            new DbEngineUtilLokijs("role", loki), null
        );

        // Role permission bit
        Persistence.rolePermissionBitDao = new RolePermissionDao(
            new DbEngineUtilLokijs("rolePermissionBit", loki), null
        );
    }

    private static _log = logger.getLogger("BootstrapLokiJsDaos");
}
