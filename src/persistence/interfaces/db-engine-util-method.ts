/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */
import {IDbParams} from "./db-params";
import Promise = require("bluebird");
/**
 * Interface that defines the basic methods
 * per db engine
 */
export interface IDbEngineUtilClass {
    findOneById(id, params: IDbParams): Promise<any>;
    findAllByIds(arrayOfIds: any[], params: IDbParams): Promise<any>;
    remove(objectToDelete: any, params: IDbParams): Promise<any>;
    count(params: IDbParams): Promise<number>;
    deleteAll(params: IDbParams): Promise<any>;
    findOneByAttribute(attributeName: string, value, params: IDbParams): Promise<any>;
    findAllByAttribute(attributeName: string, value, params: IDbParams): Promise<any[]>;
    findAllByAttributeNameIn(attributeName: string, values: any[], params: IDbParams): Promise<any>;
    insertMethod(objectToInsert: any, params: IDbParams): Promise<any>;
    updateMethod(objectToUpdate: any, params: IDbParams): Promise<any>;
    insertManyMethod(objectsToInsert: any[], params: IDbParams): Promise<any>;
}
