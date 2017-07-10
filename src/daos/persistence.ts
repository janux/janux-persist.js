/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import {AuthContextDao} from "./auth-context/auth-context-dao";
import {CityDao} from "./city/city-dao";
import {CountryDao} from "./country/country-dao";
import {DisplayNameDao} from "./display-name/display-name-dao";
import {PartyDao} from "./party/party-dao";
import {PermissionBitDao} from "./permission-bit/permission-bit-dao";
import {RolePermissionDao} from "./role-permission-bit/role-permission-bit-dao";
import {RoleDao} from "./role/role-dao";
import {StateProvinceDao} from "./state-province/state-province-dao";
import {UserRoleDao} from "./user-role/user-role-dao";
import {UserDao} from "./user/user-dao";

export class Persistence {
    public static userDao: UserDao;
    public static userRoleDao: UserRoleDao;
    public static displayNameDao: DisplayNameDao;
    public static authContextDao: AuthContextDao;
    public static permissionBitDao: PermissionBitDao;
    public static roleDao: RoleDao;
    public static rolePermissionBitDao: RolePermissionDao;
    public static countryDao: CountryDao;
    public static stateProvinceDao: StateProvinceDao;
    public static partyDao: PartyDao;
    public static cityDao: CityDao;
}
