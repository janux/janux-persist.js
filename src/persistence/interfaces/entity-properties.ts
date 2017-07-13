/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

/**
 * Base interface for any entity properties.
 */
export interface IEntityProperties {

    // If true, the dao adds a uuid string before an insert.
    identifiable: boolean;

    // If true, the dao adds an lastUpdated attribute and insertDate attribute
    timeStamp: boolean;

}
