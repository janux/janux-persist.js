/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

/**
 * Base interface for any entity properties.
 * The idea of this class is to add custom functionality per entity.
 */
export interface EntityProperties {

    // If true, the dao adds a uuid string before an insert.
    // Also every query returns the inserted uuid.
    identifiable: boolean;

    // If true, the dao adds an lastUpdated attribute and insertDate attribute
    // Also the query return both attributes( if available).
    timeStamp: boolean;

}
