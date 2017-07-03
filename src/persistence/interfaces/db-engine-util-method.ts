/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */
import Promise = require("bluebird");
import {AttributeFilter} from "../impl/attribute-filter";
/**
 * Interface that defines the basic methods
 * per db engine
 */
export interface IDbEngineUtil {
    findOneById(id): Promise<any>;
    findAllByIds(arrayOfIds: any[]): Promise<any>;
    remove(objectToDelete: any): Promise<any>;
    removeById(id: string): Promise<any>;
    count(): Promise<number>;
    deleteAll(): Promise<any>;
    deleteAllByIds(ids: string[]): Promise<any>;
    findOneByAttribute(attributeName: string, value): Promise<any>;
    findAllByAttribute(attributeName: string, value): Promise<any[]>;
    findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<any>;
    insertMethod(objectToInsert: any): Promise<any>;
    updateMethod(objectToUpdate: any): Promise<any>;
    insertManyMethod(objectsToInsert: any[]): Promise<any>;
    findAll(): Promise<any[]>;
    findAllByAttributesAndOperator(attributes: AttributeFilter[]): Promise<any[]>;
    findAllByAttributesOrOperator(attributes: AttributeFilter[]): Promise<any[]>;
    findAllByQuery(query: any): Promise<any[]>;
}
