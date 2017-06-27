/**
 * Project janux-persistence
 * Created by ernesto on 6/26/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import * as logger from 'log4js';
import {AuthContextDao} from "../../daos/auth-context/auth-context-dao";
import {AuthContextEntity} from "../../daos/auth-context/auth-context-entity";
import {PermissionBitDao} from "../../daos/permission-bit/permission-bit-dao";
import {PermissionBitEntity} from "../../daos/permission-bit/permission-bit-entity";
import {Persistence} from "../../daos/persistence";

export class PermissionBitService {

    public static findAllByIds(ids: string[]): Promise<any> {
        this._log.debug("Call to findAllByIds with ids: %j", ids);
        let resultPermissionBits: any;
        return this.permissionBitDao.findAllByIds(ids)
            .then((permissionBits: PermissionBitEntity[]) => {
                resultPermissionBits = permissionBits;
                const idsAuthContext = permissionBits.map((value, index, array) => value.idAuthContext);
                return this.authCodexDao.findAllByIds(idsAuthContext);
            })
            .then((authContexts: AuthContextEntity[]) => {
                for (const permissionBit of resultPermissionBits) {
                    permissionBit.authContext = _.find(authContexts, (o) => {
                        return o.id === permissionBit.idAuthContext;
                    });
                }
                return Promise.resolve(resultPermissionBits);
            });
    }

    private static _log = logger.getLogger("PermissionBitService");
    private static authCodexDao: AuthContextDao = Persistence.authContextDao;
    private static permissionBitDao: PermissionBitDao = Persistence.permissionBitDao;
}
