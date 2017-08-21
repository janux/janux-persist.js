/**
 * Project janux-persistence
 * Created by ernesto on 7/28/17.
 */
import Promise = require("bluebird");
import {AttributeFilter} from "../../implementations/dao/attribute-filter";

/**
 * Define the methods for read only daos.
 */
export interface ReadOnlyRepository<T, ID> {
    /**
     * Return count of all entities of this Type
     */
    count(): Promise<number>;

    /**
     * Load a specific entity
     * @param id The id to look for.
     */
    findOne(id: ID): Promise<T>;

    /**
     * Find all entities that match a certain query, where the query object may
     * vary according to the underlying implementation of the entity store.
     * @param query A mongoose-like query.
     */
    findByQuery(query: any): Promise<T[]>;

    /**
     * Find all entities with the given IDs
     * @param arrayOfIds The ids to look for.
     */
    findByIds(arrayOfIds: ID[]): Promise<T[]>;

    /**
     * Find the first entity that has the attributeName and the value.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     */
    findOneByAttribute(attributeName: string, value): Promise<T>;

    /**
     * Find all the entities that have the attributeName and the value.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     */
    findByAttribute(attributeName: string, value): Promise<T[]>;

    /**
     * Find all the entities that have the attribute defined in the method and whose values
     * belongs to the list.
     * @param attributeName The attribute to look for.
     * @param values The values to compare.
     */
    findByAttributeNameIn(attributeName: string, values: any[]): Promise<T[]>;

    /**
     * Return all entities of this type
     */
    findAll(): Promise<T[]>;

    /**
     * Find all the entities that match all attributes.
     * @param attributes The attributes-value filters.
     */
    findByAttributesAllMatching(attributes: AttributeFilter[]): Promise<T[]>;

    /**
     * Find all entities that match any one of the attributes.
     * @param attributes The attributes-value filters.
     */
    findByAttributesAnyMatching(attributes: AttributeFilter[]): Promise<T[]>;
}
