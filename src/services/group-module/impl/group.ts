/**
 * Project
 * Created by ernesto on 8/16/17.
 */

import {Group} from "../api/group";

/**
 * This class saves the group information
 */
export class GroupImpl<t> implements Group<t> {
    // A user readable name
    name: string;

    // This attribute must be unique to the collection.
    // This is a developer and db friendly attribute that helps to identify the group.
    code: string;

    // Description of the group
    description: string;

    // Content of the group. It is responsibility of the developer to make sure
    // the values is simple enough to be saved in a database and query-able by db engines.
    // A personal recommendation is to save the references of the objects.
    values: t[] = [];
}
