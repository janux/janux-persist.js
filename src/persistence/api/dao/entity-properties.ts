/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

/**
 * Base interface for any entity properties.
 * The idea of this class is to add custom functionality per entity.
 */
export interface EntityProperties {

    // If true, then the system generates an unique uuid v4 value.
    // The generated id is string and ignores the ID generic of the dao
    // implementation, leading to potential bugs.
    // You need to make sure the dao is implemented using a string ID generic.
    autoGenerated: boolean;

    // If true, the dao adds an lastUpdated attribute and insertDate attribute
    // Also the query return both attributes( if available).
    timeStamp: boolean;

}