/**
 * Project
 * Created by ernesto on 8/16/17.
 */

/**
 * The entity for the values of the group
 */
export class GroupValueEntity {

    // The id to the database
    id: string;

    // The id of the group.
    idGroup: string;

    // The object that belong to the group. The developer is responsible
    // to save enough information in order to identify the object
    // Also, the values to the object must be database friendly and database query-able.
    value: any;

}
