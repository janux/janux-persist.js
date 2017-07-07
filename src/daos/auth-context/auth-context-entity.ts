/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */
export class AuthContextEntity {

    public id: string;

    /** A unique name for this AuthorizationContext, in the context of the Application */
    name: string;

    /** Human readable description of this iPermissionBit Set */
    description: string;

    /** The order in which this AuthorizationContext should be displayed */
    sortOrder: number;

    /** Determines whether or not this AuthorizationContext is being used */
    enabled: boolean;

    /** Id of the associated display name */
    idDisplayName: string;

    constructor(name: string, description: string, sortOrder: number, enabled: boolean, idDisplayName: string) {
        this.name = name;
        this.description = description;
        this.sortOrder = sortOrder;
        this.enabled = enabled;
        this.idDisplayName = idDisplayName;
    }
}
