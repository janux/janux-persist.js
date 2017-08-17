/**
 * Project
 * Created by ernesto on 8/16/17.
 */

export class GroupEntity {
    id: string;

    // A user readable name
    name: string;

    // This attribute must be unique to the collection.
    // This is a developer and db friendly attribute that helps to identify the group.
    code: string;

    // Description of the group
    description: string;
}
