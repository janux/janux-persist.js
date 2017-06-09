/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

import * as _ from 'lodash';
import * as logger from 'log4js';
import uuid = require("uuid");
import {IDataAccessObject} from "../interfaces/data-acces-object";
import Promise = require("bluebird");
import {IEntity} from "../interfaces/entity";
import {IValidaionError} from "../interfaces/validation-error";

export abstract class AbstractDataAccessObject<t extends IEntity> implements IDataAccessObject {

    private readonly _log = logger.getLogger("DataAccessObject");
    private readonly COMES_FROM_I_VERSIONABLE: string = "comesFromIVersionable";
    private readonly DATE_CREATED_PROPERTY: string = "dateCreated";
    private readonly DATE_UPDATED_PROPERTY: string = "dateUpdated";

    public insert<t>(objectToInsert: t): Promise<t | IValidaionError[]> {
        this._log.debug('Call to insert with %j', objectToInsert);
        let entityErrors: IValidaionError[];
        // Check for an null id
        if (!_.isEmpty(objectToInsert.id) || !_.isEmpty(objectToInsert.uuid)) {
            this._log.error('%j has an id', objectToInsert);
            return Promise.reject('Object has a defined id');
        }
        // Validate the entity information
        entityErrors = this.validateEntity(objectToInsert);
        if (entityErrors.length === 0) {
            // Call validateBeforeInsert in order to validate the entity against the database.
            return this.validateBeforeInsert(objectToInsert).then((validations: IValidaionError[]) => {
                this._log.debug("Returned errors from validateBeforeUpdate %j: ", validations);
                if (validations.length === 0) {
                    // If the object has an COMES_FROM_I_VERSIONABLE, let's add the
                    // current date.
                    if (objectToInsert.hasOwnProperty(this.COMES_FROM_I_VERSIONABLE)) {
                        objectToInsert[this.DATE_CREATED_PROPERTY] = new Date();
                    }
                    // Generate a unique uuid
                    objectToInsert.uuid = uuid.v1();
                    return this.insertMethod<t>(objectToInsert)
                        .then((insertedObject: t) => {
                            if (!_.isEmpty(insertedObject.idKeyIdentification)) {
                                insertedObject.id = insertedObject[insertedObject.idKeyIdentification];
                                return Promise.resolve(insertedObject);
                            }
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
     * Update the object.
     * Validate the object before update by checking and id attribute and calling
     * validateEntity and validateBeforeUpdate
     * @param objectToUpdate The object to update
     * @returns {any} A promise containing the updated object or a reject if something went wrong.
     */
    public update<t>(objectToUpdate: t): Promise<t | IValidaionError[]> {
        this._log.debug('Call to update with %j', objectToUpdate);
        let entityErrors: IValidaionError[];
        if (_.isEmpty(objectToUpdate.id) || _.isEmpty(objectToUpdate.uuid)) {
            this._log.error('%j does not have an id', objectToUpdate);
            return Promise.reject('Object does not have an id');
        }
        entityErrors = this.validateEntity(objectToUpdate);
        if (entityErrors.length === 0) {
            return this.validateBeforeUpdate(objectToUpdate)
                .then((validations: IValidaionError[]) => {
                    this._log.debug("Returned errors from validateBeforeUpdate %j: ", validations);
                    if (validations.length === 0) {
                        if (objectToUpdate.hasOwnProperty(this.COMES_FROM_I_VERSIONABLE)) {
                            objectToUpdate[this.DATE_UPDATED_PROPERTY] = new Date();
                        }
                        return this.updateMethod(objectToUpdate)
                            .then((updatedObject: t) => {
                                updatedObject.id = updatedObject[updatedObject.idKeyIdentification];
                                return Promise.resolve(updatedObject);
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
     * Query an object by the id.
     * @param id The id.
     */
    public abstract findOneById(id): Promise<t>;

    /**
     * Query several objects by a array of ids.
     * @param arrayOfIds An array of ids.
     */
    public abstract findAllByIds(arrayOfIds: any[]): Promise<t[]>;

    /**
     * This method must be implemented in order to delete an record to the database.
     * @param objectToDelete The object to delete
     */
    public abstract remove<t>(objectToDelete: t): Promise<any>;

    /**
     * Returns the amount of records that has the entity
     */
    public abstract count(): Promise<number>;

    /**
     * Delete all records
     */
    public abstract deleteAll(): Promise<any>;

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return an array with the results,
     * or an empty array if the query returned nothing.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected abstract findAllByAttribute(attributeName: string, value): Promise<t[]>;

    /**
     * Perform a query where the method filter an attribute by several values.
     * @param attributeName The attribute to look for.
     * @param values The list of values to filter.
     */
    protected abstract findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<t[]>;

    /**
     * This method must be implemented in order to insert an object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectToInsert The object to insert
     */
    protected abstract insertMethod<t>(objectToInsert: t): Promise<t>;

    /**
     * This method must be implemented in order to update an object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectToUpdate The object to update
     */
    protected abstract updateMethod<t>(objectToUpdate: t): Promise<t>;

    /**
     * This method must be implemented in order to insert several object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectsToInsert The objects to insert
     */
    protected abstract insertManyMethod<t>(objectsToInsert: t[]): Promise<any>;

    /**
     * This method must be implemented in order to perform non database validations before an insert or update,
     * such as non null values, email validations, regexp validations.
     * @param objectToValidate The object to validate
     * @return An array containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected abstract validateEntity<t>(objectToValidate: t): IValidaionError[];

    /**
     * This method must be implemented in order to perform database validations before an insert,
     * such as look for duplicated records.
     * @param objectToInsert The object to validate.
     * @return A promise containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected abstract validateBeforeInsert<t>(objectToInsert: t): Promise<IValidaionError[]>;

    /**
     * This method must be implemented in order to perform database validations before an update,
     * such as look for duplicated records.
     * @param objectToUpdate To object to validate
     * @return A promise containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected abstract validateBeforeUpdate<t>(objectToUpdate: t): Promise<any>;
}
