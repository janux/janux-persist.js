/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

/*
 This interface help to generate a
 dateUpdated attribute and lastUpdated attribute
 */
export  interface IVersionable {
    dateUpdated: Date;
    dateCreated: Date;
    comesFromIVersionable: string;
}
