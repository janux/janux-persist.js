import {IEntity} from "./entity";
import {IValidaionError} from "./validation-error";
/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

export  interface IDataAccessObject<t extends IEntity> {

    insert<t>(objectToInsert: t): Promise<t | IValidaionError[]>;

    update<t>(objectToUpdate: t): Promise<t | IValidaionError[]>;

    findOneById(id): Promise<t>;

    findAllByIds(arrayOfIds: any[]): Promise<t[]>;

    remove<t>(objectToDelete: t): Promise<any>;

    count(): Promise<number>;

    deleteAll(): Promise<any>;

    findAllByAttribute(attributeName: string, value): Promise<t[]>;

    findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<t[]>;

    insertMethod<t>(objectToInsert: t): Promise<t>;

    updateMethod<t>(objectToUpdate: t): Promise<t>;

    insertManyMethod<t>(objectsToInsert: t[]): Promise<any>;

    validateEntity<t>(objectToValidate: t): IValidaionError[];

    validateBeforeInsert<t>(objectToInsert: t): Promise<IValidaionError[]>;

    validateBeforeUpdate<t>(objectToUpdate: t): Promise<any>;
}
