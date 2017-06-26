/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */

import {IEntity} from "../../persistence/interfaces/entity";
/**
 * This class help to make a relation between accounts and roles
 */
export class AccountRoleEntity implements IEntity {

    public id: string;
    public idAccount: string;
    public idRole: string;
}
