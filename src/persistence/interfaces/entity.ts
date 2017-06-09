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
}
