/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */

import {IEntity} from "../../persistence/interfaces/entity";
/**
 * This class defines the association between a role
 * and a permission bit ( also a auth context).
 */
export class RolePermissionBitEntity implements IEntity {
    public id: string;
    public idRole: string;
    public idPermissionBit: string;

    constructor(idRole: string, idPermissionBit: string) {
        this.idRole = idRole;
        this.idPermissionBit = idPermissionBit;
    }
}
