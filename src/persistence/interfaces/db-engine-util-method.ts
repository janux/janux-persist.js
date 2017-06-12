/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */
import Promise = require("bluebird");
/**
 * Interface that defines the basic methods
 * per db engine
 */
export interface IDbEngineUtil {
    findOneById(id): Promise<any>;
    findAllByIds(arrayOfIds: any[]): Promise<any>;
    remove(objectToDelete: any): Promise<any>;
    count(): Promise<number>;
    deleteAll(): Promise<any>;
    findOneByAttribute(attributeName: string, value): Promise<any>;
    findAllByAttribute(attributeName: string, value): Promise<any[]>;
    findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<any>;
    insertMethod(objectToInsert: any): Promise<any>;
    updateMethod(objectToUpdate: any): Promise<any>;
    insertManyMethod(objectsToInsert: any[]): Promise<any>;
}
