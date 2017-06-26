import {IEntity} from "../../persistence/interfaces/entity";
/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
export class RoleEntity implements IEntity {

    public id: string;

    /** a unique short-hand name for this role */
    public name: string;

    /** Human readable description of this Role */
    public description: string;

    /** whether or not this Role is usable in the system */
    public enabled: boolean = true;

    /**
     * Flag indicating if the role is a root role.
     * If the role is root, the idParentRole must be undefined.
     * If the role is nor root, then idParent role must have the reference
     * of the root role.
     */
    public isRoot: boolean;

    /**
     * If the role has a parent. Here is
     * where we place the id of the parent role
     * If the role does not have a parent, then
     * the value must be undefined.
     */
    public idParentRole: string;

    constructor(name: string, description: string, enabled: boolean, isRoot: boolean, idParentRole: string) {
        this.name = name;
        this.description = description;
        this.enabled = enabled;
        this.isRoot = isRoot;
        this.idParentRole = idParentRole;
    }
}
