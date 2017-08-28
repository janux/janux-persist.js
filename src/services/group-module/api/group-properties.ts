/**
 * Project
 * Created by ernesto on 8/25/17.
 */

/**
 * Properties of a group.
 */
export interface GroupProperties {

    // A user readable name.
    name: string;

    // Description of the group.
    description: string;

    // This is a key-value map that helps to identify groups with the same type between each other.
    // All groups that shares the same type must have different key-value map.
    // It is crucial to kep the attributes and values as string.
    attributes: { [key: string]: string };
}
