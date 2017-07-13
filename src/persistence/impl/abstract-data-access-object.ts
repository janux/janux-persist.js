/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

import * as _ from 'lodash';
import * as logger from 'log4js';
import uuid = require("uuid");
import Promise = require("bluebird");
import {isBlankString} from "../../util/blank-string-validator";
import {IEntityProperties} from "../interfaces/entity-properties";
import {IValidationError} from "../interfaces/validation-error";
import {TimeStampGenerator} from "../util/TimeStampGenerator";
import {UuidGenerator} from "../util/UuidGenerator";
import {AttributeFilter} from "./attribute-filter";

/**
 * Base class of a dao.
 * This class defines the method the extended classes must implement.
 * This class defines a generic. With this I force all the extended class must defined which object type
 * is going to be used by the dao.
 */
export abstract class AbstractDataAccessObject<t> {

    // It attribute name that has the unique db id.
    public ID_REFERENCE: string = "id";

    // The entity properties.
    protected entityProperties: IEntityProperties;
    private readonly _log = logger.getLogger("AbstractDataAccessObject");

    constructor(entityProperties: IEntityProperties) {
        this.entityProperties = entityProperties;
    }

    /**
     * Inserts an object in the database.
     * This method performs the following.
     * 1.- Validates if the object does not have an id.
     * 2.- Validate if the entity has the correct values by calling the method validateEntity.
     * 3.- Validate if the entity is correct against the collection where is going to be inserted by calling the
     * method validateBeforeInsert.
     * 4.- Adds the dateCreated attribute by calling TimeStampGenerator.generateTimeStampForInsert().
     * 5.- Adds the uuid attribute by calling UuidGenerator.assignUuid.
     * 6.- Insert the object in the database by calling insertMethod (). This method is implemented by the extended classes.
     * The content to insert can be modified before insert in the database by the method convertBeforeSave.
     * 7.- Retrieves the content of insertMethod() and calls  the method convertAfterDbOperation.
     * 8.- Returns the inserted object.
     * @param objectToInsert
     * @return {any}
     */
    public insert(objectToInsert: t): Promise<t | IValidationError[]> {
        this._log.debug('Call to insert with %j', objectToInsert);
        let entityErrors: IValidationError[];
        // Check for an null id
        if (isBlankString(objectToInsert[this.ID_REFERENCE]) === false) {
            this._log.error('%j has an id', objectToInsert[this.ID_REFERENCE]);
            return Promise.reject('Object has a defined id');
        }
        // Validate the entity information
        entityErrors = this.validateEntity(objectToInsert);
        if (entityErrors.length === 0) {
            // Call validateBeforeInsert in order to validate the entity against the database.
            return this.validateBeforeInsert(objectToInsert).then((validations: IValidationError[]) => {
                this._log.debug("Returned errors from validateBeforeInsert %j: ", validations);
                if (validations.length === 0) {
                    // Generate the timestamp
                    TimeStampGenerator.generateTimeStampForInsert(this.entityProperties, objectToInsert);
                    // Generate a unique uuid
                    UuidGenerator.assignUuid(this.entityProperties, objectToInsert);
                    return this.insertMethod(this.addExtraValues(this.convertBeforeSave(objectToInsert), objectToInsert))
                        .then((resultInsert: any) => {
                            let result = this.convertAfterDbOperation(resultInsert);
                            result = this.addExtraValues(result, resultInsert);
                            return Promise.resolve(result);
                        });
                } else {
                    return Promise.reject(validations);
                }
            });
        } else {
            this._log.warn('%j has validation errors: \n %j', objectToInsert, entityErrors);
            return Promise.reject(entityErrors);
        }
    }

    /**
     * Insert a list of records to the database.
     * This method performs the following.
     * 1.- Validates if the objects does not have an id.
     * 2.- Validate if the entities has the correct values by calling the method validateEntity.
     * 3.- Adds the dateCreated attribute by calling TimeStampGenerator.generateTimeStampForInsert().
     * 4.- Adds the uuid attribute by calling UuidGenerator.assignUuid.
     * 5.- Insert the object in the database by calling insertManyMethod(). This method is implemented by the extended classes.
     * The content to insert can be modified before insert in the database by the method convertBeforeSave.
     * 6.- Retrieves the content of insertManyMethod() and calls  the method convertAfterDbOperation.
     * 7.- Returns the inserted objects.
     * This method DOES NOT CHECK DATA CONSISTENCY. The data you are going to insert must be clean.
     * @param objectsToInsert The objects to insert
     * @returns {any} A promise containing the inserted objects, a rejected promise if something went wrong
     */
    public insertMany(objectsToInsert: t[]): Promise<any> {
        this._log.debug('Call to insertMany with %j', objectsToInsert.length);
        const convertedObjectsToInsert: any = [];
        let entityErrors: IValidationError[];
        for (const obj of objectsToInsert) {
            if (obj[this.ID_REFERENCE] != null) {
                this._log.error('%j has an id', obj);
                return Promise.reject('Object has a defined id');
            }
        }
        for (const obj of objectsToInsert) {
            entityErrors = this.validateEntity(obj);
            if (entityErrors.length > 0) {
                this._log.warn('%j has validation errors: \n %j', obj, entityErrors);
                return Promise.reject(entityErrors);
            } else {
                // Generate the timestamp
                TimeStampGenerator.generateTimeStampForInsert(this.entityProperties, obj);
                // Generate a unique uuid
                UuidGenerator.assignUuid(this.entityProperties, obj);
                convertedObjectsToInsert.push(this.addExtraValues(this.convertBeforeSave(obj), obj));
            }
        }
        // TODO: maybe add a beforeInsertMany abstract method
        return this.insertManyMethod(convertedObjectsToInsert)
            .then((insertedRecords: any[]) => {
                return Promise.resolve(insertedRecords.map((value) => this.addExtraValues(this.convertAfterDbOperation(value), value)));
            });
    }

    /**
     * Update the object.
     * The method performs the following tasks.
     * 1.- Validates if the object does have an id.
     * 2.- Validate if the entity has the correct values by calling the method validateEntity.
     * 3.- Validate if the entity is correct against the collection where is going to be inserted by calling the
     * method validateBeforeUpdate.
     * 4.- Adds the lastUpdate attribute by calling TimeStampGenerator.generateTimeStampForUpdate().
     * 5.- Update the object in the database by calling updateMethod (). This method is implemented by the extended classes.
     * The content to update can be modified before update in the database by the method convertBeforeSave.
     * 6.- Retrieves the content of updateMethod() and calls  the method convertAfterDbOperation.
     * 7.- Returns the updated object.
     * @param objectToUpdate The object to update
     * @returns {any} A promise containing the updated object or a reject if something went wrong.
     */
    public update(objectToUpdate: t): Promise<t | IValidationError[]> {
        this._log.debug('Call to update with %j', objectToUpdate);

        let entityErrors: IValidationError[];
        if (isBlankString(objectToUpdate[this.ID_REFERENCE])) {
            this._log.error('%j does not have an id', objectToUpdate);
            return Promise.reject('Object does not have an id');
        }
        entityErrors = this.validateEntity(objectToUpdate);
        if (entityErrors.length === 0) {
            return this.validateBeforeUpdate(objectToUpdate)
                .then((validations: IValidationError[]) => {
                    this._log.debug("Returned errors from validateBeforeUpdate %j: ", validations);
                    if (validations.length === 0) {
                        TimeStampGenerator.generateTimeStampForUpdate(this.entityProperties, objectToUpdate);
                        return this.updateMethod(this.addExtraValues(this.convertBeforeSave(objectToUpdate), objectToUpdate))
                            .then((resultInsert: any) => {
                                let result = this.convertAfterDbOperation(resultInsert);
                                result = this.addExtraValues(result, resultInsert);
                                return Promise.resolve(result);
                            });
                    } else {
                        return Promise.reject(validations);
                    }
                });
        } else {
            this._log.warn('%j has validation errors: \n %j', objectToUpdate, entityErrors);
            return Promise.reject(entityErrors);
        }
    }

    /**
     * Update an object if the object has an id.
     * Insert a new object if the object does not have an id.
     * @param object The object to insert or update.
     */
    public updateOrInsert(object: t): Promise<t | IValidationError[]> {
        this._log.debug("Call to updateOrInsert with object %j", object);
        if (isBlankString(object[this.ID_REFERENCE])) {
            return this.insert(object);
        } else {
            return this.update(object);
        }
    }

    /**
     * Find one record by the id.
     * @param id The id to look for.
     * @return {Bluebird<t>} Return the document whose id matches the id. If no record is founded then the method
     * returns null.
     */
    public findOneById(id: string): Promise<t> {
        return this.findOneByIdMethod(id)
            .then((resultQuery: any) => {
                return Promise.resolve(_.isNil(resultQuery) ? resultQuery : this.addExtraValues(this.convertAfterDbOperation(resultQuery), resultQuery));
            });
    }

    /**
     * Find all records inside whose ids belongs to the list.
     * @param arrayOfIds The ids to look for.
     * @return {Bluebird<any[]>} A promise containing the result. If no records are founded, then the method returns
     * an empty array.
     */
    public findAllByIds(arrayOfIds: any[]): Promise<t[]> {
        return this.findAllByIdsMethod(arrayOfIds)
            .then((resultQuery: any[]) => {
                return Promise.resolve(resultQuery.map((value) => this.addExtraValues(this.convertAfterDbOperation(value), value)));
            });
    }

    /**
     * Remove the object.
     * This method must be implemented in order to delete an record to the database.
     * WARNING: This method IS NOT protected by any relational integrity rule because
     * noSql databases doesn't have this feature. Be VERY, VERY careful when calling this method.
     * Nothing (you, the db engine or anything else) will stop the operation once called.
     * @param objectToDelete The object to delete
     */
    public abstract remove(objectToDelete: t): Promise<any>;

    /**
     * Same as remove. Instead of sending the object, you send the id.
     * @param id The id.
     */
    public abstract removeById(id: string): Promise<any>;

    /**
     * Returns the amount of records.
     */
    public abstract count(): Promise<number> ;

    /**
     * Returns all records.
     * The returned object can be modified if the extended class overrides the method convertAfterDbOperation.
     * @return {Bluebird<any[]>}
     */
    public findAll(): Promise<t[]> {
        return this.findAllMethod()
            .then((resultQuery: any[]) => {
                return Promise.resolve(resultQuery.map((value) => this.addExtraValues(this.convertAfterDbOperation(value), value)));
            });
    }

    /**
     * Find one that has the attributeName and the value.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Bluebird<t>} Return the document that matches the criteria. Returns a reject if there are more than
     * one document that matches the criteria.
     */
    public findOneByAttribute(attributeName: string, value): Promise<t> {
        return this.findOneByAttributeMethod(attributeName, value)
            .then((resultQuery: any) => {
                return Promise.resolve(_.isNil(resultQuery) ? resultQuery : this.addExtraValues(this.convertAfterDbOperation(resultQuery), resultQuery));
            });
    }

    /**
     * Find all the records that has the attributeName and the value.
     * @param attributeName The attribute to look for.
     * @param value The value to compare.
     * @return {Bluebird<any[]>} Return a list of documents that matches the criteria. If no records are founded, then the method
     * returns an empty array.
     */
    public findAllByAttribute(attributeName: string, value): Promise<t[]> {
        return this.findAllByAttributeMethod(attributeName, value)
            .then((resultQuery: any[]) => {
                return Promise.resolve(resultQuery.map((value) => this.addExtraValues(this.convertAfterDbOperation(value), value)));
            });
    }

    /**
     * Find all records whose attribute vales matches with any value of the list.
     * @param attributeName The attribute to look for.
     * @param values The values to match.
     * @return {Bluebird<any[]>}
     */
    public findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<t[]> {
        return this.findAllByAttributeNameInMethod(attributeName, values)
            .then((resultQuery: any[]) => {
                return Promise.resolve(resultQuery.map((value) => this.addExtraValues(this.convertAfterDbOperation(value), value)));
            });
    }

    /**
     * Find all the documents that matches all attributes.
     * @param attributes The attributes-value filters.
     * @return {Bluebird<any[]>} The objects that matches the criteria.
     */
    public findAllByAttributesAndOperator(attributes: AttributeFilter[]): Promise<t[]> {
        return this.findAllByAttributesAndOperatorMethod(attributes)
            .then((resultQuery: any[]) => {
                return Promise.resolve(resultQuery.map((value) => this.addExtraValues(this.convertAfterDbOperation(value), value)));
            });
    }

    /**
     * Find all the documents that matches only one of the attributes.
     * @param attributes The attributes-value filters.
     */
    public findAllByAttributesOrOperator(attributes: AttributeFilter[]): Promise<t[]> {
        return this.findAllByAttributesOrOperatorMethod(attributes)
            .then((resultQuery: any[]) => {
                return Promise.resolve(resultQuery.map((value) => this.addExtraValues(this.convertAfterDbOperation(value), value)));
            });
    }

    /**
     * Delete all records.
     * WARNING: This method IS NOT protected by any relational integrity rule because
     * noSql databases doesn't have this feature. Be VERY, VERY careful when calling this method,
     * you can destroy your database data integrity so easily.
     * Nothing (you, the db engine or anything else) will stop the operation once called.
     */
    public abstract deleteAll(): Promise<any> ;

    /**
     * Delete all records that that whose id is in the array.
     * WARNING: This method IS NOT protected by any relational integrity rule because
     * noSql databases doesn't have this feature. Be VERY, VERY careful when calling this method,
     * you can destroy your database data integrity so easily.
     * Nothing (you, the db engine or anything else) will stop the operation once called.
     * @param ids The ids to filter.
     */
    public abstract deleteAllByIds(ids: string[]): Promise<any>;

    /**
     * Find all documents that matches with the query criteria. The query for the moment is a mongo-like query object.
     * @param query The query criteria.
     * @return {Bluebird<any[]>} The objects that matches the query criteria. If no records are founded, then the method
     * returns an empty array.
     */
    protected findAllByQuery(query: any): Promise<t[]> {
        return this.findAllByQueryMethod(query)
            .then((resultQuery: any[]) => {
                return Promise.resolve(resultQuery.map((value) => this.addExtraValues(this.convertAfterDbOperation(value), value)));
            });
    }

    /**
     * Return all records.
     * This method bust be implemented by the extended classes.
     */
    protected abstract findAllMethod(): Promise<t[]>;

    /**
     * This method bust be implemented by the extended classes.
     * Query an object by the id.
     * @param id The id.
     */
    protected abstract findOneByIdMethod(id: string): Promise<t>;

    /**
     * This method bust be implemented by the extended classes.
     * Query several objects by a array of ids.
     * @param arrayOfIds An array of ids.
     */
    protected abstract findAllByIdsMethod(arrayOfIds: any[]): Promise<t[]> ;

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return only one record,
     * and send an error if the query returned more than one result.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected abstract findOneByAttributeMethod(attributeName: string, value): Promise<t>;

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return an array with the results,
     * or an empty array if the query returned nothing.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected abstract findAllByAttributeMethod(attributeName: string, value): Promise<t[]>;

    /**
     * Perform a query where the method filter an attribute by several values.
     * @param attributeName The attribute to look for.
     * @param values The list of values to filter.
     */
    protected abstract findAllByAttributeNameInMethod(attributeName: string, values: any[]): Promise<t[]>;

    /**
     * Perform a query with the and operator for every attribute and value
     * @param attributes The attributes to filter
     */
    protected abstract findAllByAttributesAndOperatorMethod(attributes: AttributeFilter[]): Promise<t[]>;

    /**
     * Perform a query with the or operator for every attribute and value
     * @param attributes The attributes to filter
     */
    protected abstract findAllByAttributesOrOperatorMethod(attributes: AttributeFilter[]): Promise<t[]>;

    /**
     * This method must be implemented in order to insert an object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectToInsert The object to insert
     */
    protected abstract insertMethod(objectToInsert: t): Promise<t>;

    /**
     * This method must be implemented in order to update an object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectToUpdate The object to update
     */
    protected abstract updateMethod(objectToUpdate: t): Promise<t>;

    /**
     * This method must be implemented in order to insert several object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectsToInsert The objects to insert
     */
    protected abstract insertManyMethod(objectsToInsert: t[]): Promise<t[]>;

    /**
     * This method must be implemented in order to perform non database validations before an insert or update,
     * such as non null values, email validations, regexp validations.
     * @param objectToValidate The object to validate
     * @return An array containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected abstract validateEntity(objectToValidate: t): IValidationError[];

    /**
     * This method must be implemented in order to perform a query.
     * @param query a mongodb like query.
     */
    protected abstract findAllByQueryMethod(query: any): Promise<any>;

    /**
     * This method must be implemented in order to perform database validations before an insert,
     * such as look for duplicated records.
     * @param objectToInsert The object to validate.
     * @return A promise containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected abstract validateBeforeInsert(objectToInsert: t): Promise<IValidationError[]>;

    /**
     * This method must be implemented in order to perform database validations before an update,
     * such as look for duplicated records.
     * @param objectToUpdate To object to validate
     * @return A promise containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected abstract validateBeforeUpdate(objectToUpdate: t): Promise<IValidationError[]>;

    /**
     * This method helps to transforms the object before an insert or update.
     * Sometimes the dao represents an object that is not ready to be inserted or updated in a database as it is. For example, if the object comes from
     * typescript and has private attributes, mongoose is not going to insert or update the private attributes.
     * In order to use this method the extended class must override the method.
     * @param object The object to transform.
     * @return {t} The transformed object.
     */
    protected convertBeforeSave(object: t): any {
        this._log.debug("Call to convertBeforeSave abstractDao");
        return object;
    }

    /**
     * This method helps to transforms the data contained in the database to the object represented in the dao.
     * This method is called after successful insert, successful update or after every query.
     * Sometimes the dao represents an object that is not ready to be inserted or updated as it is. For example, if the object comes from
     * typescript and has private attributes, mongoose is not going to insert or update the private attributes.
     * In order to use this method the extended class must override the method.
     * @param object
     * @return {any}
     */
    protected convertAfterDbOperation(object: any): t {
        return object;
    }

    /**
     * Calling  convertBeforeSave() convertAfterDbOperation() erases the uuid, dateCreated and lastUpdate attributes.
     * This method puts the attributes back to the object.
     * @param obj
     * @param reference
     * @return {any}
     */
    private addExtraValues(obj: any, reference: any): any {
        const id: string = 'id';
        if (_.isNil(reference[id]) === false) {
            obj[id] = reference[id];
        }
        if (_.isNil(reference[UuidGenerator.UUID_PROPERTY]) === false) {
            obj[UuidGenerator.UUID_PROPERTY] = reference[UuidGenerator.UUID_PROPERTY];
        }
        if (_.isNil(reference[TimeStampGenerator.DATE_CREATED_PROPERTY]) === false) {
            obj[TimeStampGenerator.DATE_CREATED_PROPERTY] = reference[TimeStampGenerator.DATE_CREATED_PROPERTY];
        }
        if (_.isNil(reference[TimeStampGenerator.DATE_UPDATED_PROPERTY]) === false) {
            obj[TimeStampGenerator.DATE_UPDATED_PROPERTY] = reference[TimeStampGenerator.DATE_UPDATED_PROPERTY];
        }

        return obj;
    }
}
