/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
export class RoleEntity {

    /** a unique short-hand name for this role */
    public name: string;

    /** Human readable description of this Role */
    public description: string;

    /** whether or not this Role is usable in the system */
    public enabled: boolean = true;

    /**
     * Flag indicating if the role is a 1root parent.
     * If the role has a parent role. The flag must be false.
     */
    public hasParentRole: boolean;

    /**
     * If the role has a parent. Here is
     * where we place the id of the parent role
     * If the role does not have a parent, then
     * the value must be undefined..
     */
    public idParentRole: string;

    constructor(name: string, description: string, enabled: boolean, hasParentRole: boolean, idParentRole: string) {
        this.name = name;
        this.description = description;
        this.enabled = enabled;
        this.hasParentRole = hasParentRole;
        this.idParentRole = idParentRole;
    }
}
