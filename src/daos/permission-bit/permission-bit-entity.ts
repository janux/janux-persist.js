/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */
export class PermissionBitEntity {
    /**
     * Short-hand name  for this iPermissionBit (e.g.: READ),
     * unique in the context of the containing iAuthorizationContext
     */
    public name: string;

    /** Human readable description of this iPermissionBit */
    public description: string;

    /**
     * The position of the iPermissionBit within the bit mask defined by the iAuthorizationContext, should be a
     * sequential integer relative to the sequence defined by the iAuthorizationContext; so if a iAuthorizationContext
     * defines 5 permissions, this should be a number between 0 and 4 that is not used by any of the
     * other Permissions in the iAuthorizationContext
     */
    public position: number;

    /**
     * Id for the authorization context
     */
    public idAuthContext: string;

    constructor(name: string, description: string, position: number, idAuthContext: string) {
        this.name = name;
        this.description = description;
        this.position = position;
        this.idAuthContext = idAuthContext;
    }
}
