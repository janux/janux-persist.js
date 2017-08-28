/**
 * Project
 * Created by ernesto on 8/17/17.
 */
import {GroupProperties} from "./group-properties";

/**
 * This is the content of a group.
 */
export interface Group<t> {

    // This is the type of the group. Examples:  "users group", "auth-context group", "services groups".
    // All groups of the same type are expected to share the same t.
    type: string;

    /**
     * These properties has human readable field and has the attributes that identifies different groups with the same type.
     */
    properties: GroupProperties;

    // Content of the group. It is responsibility of the developer to make sure
    // the values is simple enough to be saved in a database.
    // A recommendation is to save the references of the objects.
    values: t[];
}
