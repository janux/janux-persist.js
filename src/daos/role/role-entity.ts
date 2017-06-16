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

    constructor(name: string, description: string, enabled: boolean) {
        this.name = name;
        this.description = description;
        this.enabled = enabled;
    }
}
