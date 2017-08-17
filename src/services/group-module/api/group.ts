/**
 * Project
 * Created by ernesto on 8/17/17.
 */
export interface Group {

    // A user readable name
    name: string;

    // This attribute must be unique to the collection.
    // This is a developer and db friendly attribute that helps to identify the group.
    code: string;

    // Description of the group
    description: string;

    // Content of the group. It is responsibility of the developer to make sure
    // the content is simple enough to be saved in a database and query-able by db engines.
    // A personal recommendation is to save the references of the objects.
    content: any[];
}
