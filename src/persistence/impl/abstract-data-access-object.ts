/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

import * as _ from 'lodash';
import * as logger from 'log4js';
import uuid = require("uuid");
import {IDataAccessObject} from "../interfaces/data-acces-object";
import {IDbEngineUtilClass} from "../interfaces/db-engine-util-method";
import Promise = require("bluebird");
import {IDbParams} from "../interfaces/db-params";
import {IEntity} from "../interfaces/entity";
import {IValidationError} from "../interfaces/validation-error";

export abstract class AbstractDataAccessObject<t extends IEntity> implements IDataAccessObject {

    private readonly _log = logger.getLogger("DataAccessObject");
    private readonly COMES_FROM_I_VERSIONABLE: string = "comesFromIVersionable";
    private readonly DATE_CREATED_PROPERTY: string = "dateCreated";
    private readonly DATE_UPDATED_PROPERTY: string = "dateUpdated";

    // This variable holds all the params necessary that is going to send to the engine
    private dbParams: IDbParams;
    // This class holds all common db engine methods
    private dbEngineUtil: IDbEngineUtilClass;

    constructor(dbParams: IDbParams, dbEngineUtil: IDbEngineUtilClass) {
        this.dbParams = dbParams;
        this.dbEngineUtil = dbEngineUtil;
    }

    public insert<t>(objectToInsert: t): Promise<t | IValidationError[]> {
        this._log.debug('Call to insert with %j', objectToInsert);
        let entityErrors: IValidationError[];
        // Check for an null id
        if (!_.isEmpty(objectToInsert.id) || !_.isEmpty(objectToInsert.uuid)) {
            this._log.error('%j has an id', objectToInsert);
            return Promise.reject('Object has a defined id');
        }
        // Validate the entity information
        entityErrors = this.validateEntity(objectToInsert);
        if (entityErrors.length === 0) {
            // Call validateBeforeInsert in order to validate the entity against the database.
            return this.validateBeforeInsert(objectToInsert).then((validations: IValidationError[]) => {
                this._log.debug("Returned errors from validateBeforeUpdate %j: ", validations);
                if (validations.length === 0) {
                    // If the object has an COMES_FROM_I_VERSIONABLE, let's add the
                    // current date.
                    if (objectToInsert.hasOwnProperty(this.COMES_FROM_I_VERSIONABLE)) {
                        objectToInsert[this.DATE_CREATED_PROPERTY] = new Date();
                    }
                    // Generate a unique uuid
                    objectToInsert.uuid = uuid.v4();
                    return this.insertMethod<t>(objectToInsert);
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
    public update<t>(objectToUpdate: t): Promise<t | IValidationError[]> {
        this._log.debug('Call to update with %j', objectToUpdate);
        let entityErrors: IValidationError[];
        if (_.isEmpty(objectToUpdate.id) || _.isEmpty(objectToUpdate.uuid)) {
            this._log.error('%j does not have an id', objectToUpdate);
            return Promise.reject('Object does not have an id');
        }
        entityErrors = this.validateEntity(objectToUpdate);
        if (entityErrors.length === 0) {
            return this.validateBeforeUpdate(objectToUpdate)
                .then((validations: IValidationError[]) => {
                    this._log.debug("Returned errors from validateBeforeUpdate %j: ", validations);
                    if (validations.length === 0) {
                        if (objectToUpdate.hasOwnProperty(this.COMES_FROM_I_VERSIONABLE)) {
                            objectToUpdate[this.DATE_UPDATED_PROPERTY] = new Date();
                        }
                        return this.updateMethod(objectToUpdate);
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
    public findOneById(id: any): Promise<t> {
        return this.dbEngineUtil.findOneById(id, this.dbParams);
    }

    /**
     * Query several objects by a array of ids.
     * @param arrayOfIds An array of ids.
     */
    public  findAllByIds(arrayOfIds: any[]): Promise<t[]> {
        return this.dbEngineUtil.findAllByIds(arrayOfIds, this.dbParams);
    }

    /**
     * This method must be implemented in order to delete an record to the database.
     * @param objectToDelete The object to delete
     */
    public remove<t>(objectToDelete: t): Promise<any> {
        return this.dbEngineUtil.remove(objectToDelete, this.dbParams);
    }

    /**
     * Returns the amount of records that has the entity
     */
    public  count(): Promise<number> {
        return this.dbEngineUtil.count(this.dbParams);
    }

    /**
     * Delete all records
     */
    public  deleteAll(): Promise<any> {
        return this.dbEngineUtil.deleteAll(this.dbParams);
    }

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return only one record,
     * and send an error if the query returned more than one result.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected findOneByAttribute(attributeName: string, value): Promise<t> {
        return this.dbEngineUtil.findOneByAttribute(attributeName, value, this.dbParams);
    }

    /**
     * Perform a query where the attribute must have the value.
     * The implementation should return an array with the results,
     * or an empty array if the query returned nothing.
     * @param attributeName The attribute to look for.
     * @param value The value to look for.
     */
    protected findAllByAttribute(attributeName: string, value): Promise<t[]> {
        return this.dbEngineUtil.findAllByAttribute(attributeName, value, this.dbParams);
    }

    /**
     * Perform a query where the method filter an attribute by several values.
     * @param attributeName The attribute to look for.
     * @param values The list of values to filter.
     */
    protected findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<t[]> {
        return this.dbEngineUtil.findAllByAttributeNameIn(attributeName, values, this.dbParams);
    }

    /**
     * This method must be implemented in order to insert an object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectToInsert The object to insert
     */
    protected insertMethod<t>(objectToInsert: t): Promise<t> {
        return this.dbEngineUtil.insertMethod(objectToInsert, this.dbParams);
    }

    /**
     * This method must be implemented in order to update an object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectToUpdate The object to update
     */
    protected  updateMethod<t>(objectToUpdate: t): Promise<t> {
        return this.dbEngineUtil.updateMethod(objectToUpdate, this.dbParams);
    }

    /**
     * This method must be implemented in order to insert several object to the database.
     * This method is called from this class and should not be called from outside.
     * @param objectsToInsert The objects to insert
     */
    protected  insertManyMethod<t>(objectsToInsert: t[]): Promise<any> {
        return this.dbEngineUtil.insertManyMethod(objectsToInsert, this.dbParams);
    }

    /**
     * This method must be implemented in order to perform non database validations before an insert or update,
     * such as non null values, email validations, regexp validations.
     * @param objectToValidate The object to validate
     * @return An array containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected abstract validateEntity<t>(objectToValidate: t): IValidationError[];

    /**
     * This method must be implemented in order to perform database validations before an insert,
     * such as look for duplicated records.
     * @param objectToInsert The object to validate.
     * @return A promise containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected abstract validateBeforeInsert<t>(objectToInsert: t): Promise<IValidationError[]>;

    /**
     * This method must be implemented in order to perform database validations before an update,
     * such as look for duplicated records.
     * @param objectToUpdate To object to validate
     * @return A promise containing the validation errors. If there are no errors then
     * returns an empty array
     */
    protected abstract validateBeforeUpdate<t>(objectToUpdate: t): Promise<any>;
}
