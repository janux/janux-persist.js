/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import {AccountRoleDao} from "./account-role/account-role-dao";
import {AccountDao} from "./account/account-dao";
import {AuthContextDao} from "./auth-context/auth-context-dao";
import {CountryDao} from "./country/country-dao";
import {DisplayNameDao} from "./display-name/display-name-dao";
import {PermissionBitDao} from "./permission-bit/permission-bit-dao";
import {RolePermissionDao} from "./role-permission-bit/role-permission-bit-dao";
import {RoleDao} from "./role/role-dao";

export class Persistence {
    public static accountDao: AccountDao;
    public static accountRoleDao: AccountRoleDao;
    public static displayNameDao: DisplayNameDao;
    public static authContextDao: AuthContextDao;
    public static permissionBitDao: PermissionBitDao;
    public static roleDao: RoleDao;
    public static rolePermissionBitDao: RolePermissionDao;
    public static countryDao: CountryDao;
}
