/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */
import Promise = require("bluebird");
import {AttributeFilter} from "../../implementations/dao/attribute-filter";
import {ReadOnlyRepository} from "./read-only-repository";

/**
 * Interface that defines the basic Create Read Update Delete (CRUD) methods for
 * a DAO. These are loosely inspired by the Spring Data 2.x API for
 * CrudRepository:
 *
 * https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/repository/CrudRepository.html
 *
 *  Note that 'delete' is a reserved word in javascript, and we thus use
 *  'remove' instead.
 *
 */
export interface CrudRepository<T, ID> extends ReadOnlyRepository<T, ID> {

    /**
     * Remove an entity
     * @param objectToDelete The object to delete. 
     */
    remove(objectToDelete: any): Promise<any>;

    /**
     * Remove an entity whose id matches with the id parameter.
     * @param id The id query criteria.
     */
    removeById(id: ID): Promise<any>;

    /**
     * Delete all entities inside the collection.
     */
    removeAll(): Promise<any>;

    /**
     * Delete all entities inside the collections whose ids matches the list.
     * @param ids ids A list of ids.
     */
    removeByIds(ids: ID[]): Promise<any>;

    /**
     * Inserts an entity.
     * @param objectToInsert The object to be inserted
     */
    insert(objectToInsert: T): Promise<T>;

    /**
     * Update an entity.
     * @param objectToUpdate the object to be updated
     */
    update(objectToUpdate: T): Promise<T>;

    /**
     * Insert multiple entities at once
     * @param objectsToInsert The objects to be inserted
     */
    insertMany(objectsToInsert: T[]): Promise<T>;
}
