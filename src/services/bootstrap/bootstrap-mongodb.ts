/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as logger from 'log4js';
import {AccountRoleDao} from "../../daos/account-role/account-role-dao";
import {AccountRoleMongoDbSchema} from "../../daos/account-role/mongodb/account-role-mongodb-schema";
import {AccountDaoMongodbImpl} from "../../daos/account/mongodb/account-dao-mongodb-impl";
import {AccountMongoDbSchema} from "../../daos/account/mongodb/account-mongodb-schema";
import {AuthContextMongoDbImpl} from "../../daos/auth-context/mongodb/auth-context-dao-mongodb-impl";
import {AuthContextSchema} from "../../daos/auth-context/mongodb/auth-context-schema";
import {DisplayNameDaoMongodbImpl} from "../../daos/display-name/mongodb/display-name-dao-mondogb-impl";
import {DisplayNameMongoDbSchema} from "../../daos/display-name/mongodb/display-name-mongodb-schema";
import {PermissionBitMongodbImpl} from "../../daos/permission-bit/monodb/permission-bit-mongodb-impl";
import {PermissionBitMongoDbSchema} from "../../daos/permission-bit/monodb/permission-bit-mongodb-schema";
import {Persistence} from "../../daos/persistence";
import {RolePermissionBitMongoDbSchema} from "../../daos/role-permission-bit/mongodb/role-permission-bit-mongodb-schema";
import {RolePermissionDao} from "../../daos/role-permission-bit/role-permission-bit-dao";
import {RoleDaoMongoDbImpl} from "../../daos/role/mongodb/role-dao-mongodb-impl";
import {RoleMongoDbSchema} from "../../daos/role/mongodb/role-mongodb-schema";
import {DbEngineUtilMongodb} from "../../persistence/impl/db-engine-util-mongodb";

export class BootStrapMongoDbDaos {
    public static initMongoDbDaos(mongoose: any) {
        this._log.debug("Call to initMongoDbDaos");
        // Display name
        Persistence.displayNameDao = new DisplayNameDaoMongodbImpl(
            new DbEngineUtilMongodb(mongoose.model('displayName', DisplayNameMongoDbSchema))
            , null);

        // Account dao
        Persistence.accountDao = new AccountDaoMongodbImpl(
            new DbEngineUtilMongodb(mongoose.model('account', AccountMongoDbSchema))
            , null);

        // Account role
        Persistence.accountRoleDao = new AccountRoleDao(
            new DbEngineUtilMongodb(mongoose.model('accountRole', AccountRoleMongoDbSchema))
            , null);

        // Auth context
        Persistence.authContextDao = new AuthContextMongoDbImpl(
            new DbEngineUtilMongodb(mongoose.model('authorizationContext', AuthContextSchema))
            , null);

        // Permission bit
        Persistence.permissionBitDao = new PermissionBitMongodbImpl(
            new DbEngineUtilMongodb(mongoose.model('permissionBit', PermissionBitMongoDbSchema))
            , null);

        // Role dao
        Persistence.roleDao = new RoleDaoMongoDbImpl(
            new DbEngineUtilMongodb(mongoose.model('role', RoleMongoDbSchema))
            , null);

        // Role permissionBit
        Persistence.rolePermissionBitDao = new RolePermissionDao(
            new DbEngineUtilMongodb(mongoose.model('rolePermissionBit', RolePermissionBitMongoDbSchema))
            , null);
    }

    private static _log = logger.getLogger("BootStrapMongoDbDaos");
}
