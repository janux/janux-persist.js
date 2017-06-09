/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

/*
 Base interface for any entity
 */
import {IIdentifiable} from "./identifiable";
export interface IEntity extends IIdentifiable{
    id: string;

    // Every document engine ( lokijs o mongodb), generates and stores an unique
    // id after an insert. For mongo db id _id, for lokijs is $loki.
    // This attribute defines where the system can retrieve the
    // database identification string and store in the system.
    idKeyIdentification: string;
}
