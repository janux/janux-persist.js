/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as Promise from "bluebird";
import * as _ from 'lodash';
import * as logger from 'log4js';
import {AccountRoleDao} from "../../daos/account-role/account-role-dao";
import {AccountRoleEntity} from "../../daos/account-role/account-role-entity";
import {AccountDao} from "../../daos/account/account-dao";
import {Persistence} from "../../daos/persistence";
import {RoleDao} from "../../daos/role/role-dao";
import {RoleEntity} from "../../daos/role/role-entity";

export class AccountService {

    public static findOneByUserName(username: string): Promise<any> {
        const result: any = {};
        return this.accountDao.findOneByUserName(username)
            .then((account: any) => {
                if (_.isNull(account)) {
                    return Promise.resolve(account);
                }
                result.username = account.username;
                result.password = account.password;
                result.enabled = account.enabled;
                result.locked = account.locked;
                result.expire = account.expire;
                result.expirePassword = account.expirePassword;
                return this.accountRoleDao.findAllByAccountId(account.id);
            })
            .then((accountRoles: AccountRoleEntity[]) => {
                const idRoles = _.map(accountRoles, "idRole");
                return this.roleDao.findAllByIds(idRoles);
            })
            .then((resultRoles: RoleEntity[]) => {
                result.roles = resultRoles;
                return Promise.resolve(result);
            });
    }

    private static accountDao: AccountDao = Persistence.accountDao;
    private static accountRoleDao: AccountRoleDao = Persistence.accountRoleDao;
    private static roleDao: RoleDao = Persistence.roleDao;

    private static _log = logger.getLogger("AccountService");
}
