/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as _ from "lodash";
import * as logger from 'log4js';
import {AbstractDataAccessObjectWithAdapter} from "../../persistence/implementations/dao/abstract-data-access-object-with-engine";
import Promise = require("bluebird");
import {DbAdapter} from "../../persistence/api/dn-adapters/db-adapter";
import {EntityPropertiesImpl} from "../../persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";
import {ExampleUser} from "./example-user";
import {validateExampleUser} from "./example-validate-usert";

/**
 * This is the base dao class of the entity ExampleUser.
 */
export abstract class ExampleUserDao extends AbstractDataAccessObjectWithAdapter<ExampleUser> {

    private _logExampleUserDao = logger.getLogger("ExampleUserDao");

    constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
        super(dbAdapter, entityProperties);
    }

    /**
     * Find all users by a last name.
     * This is an example method where you can implement the query without the need to implement it for each db engine
     * @param lastName
     * @return {Promise<ExampleUser[]>}
     */
    public findByLastName(lastName: string): Promise<ExampleUser[]> {
        return this.findByAttribute("lastName", lastName);
    }

    /**
     * This is a method where you need to implement it for every db engine.
     * @param name
     */
    public abstract findByNameMatch(name: string): Promise<ExampleUser[]>;

    protected validateEntity<t>(objectToValidate: ExampleUser): ValidationErrorImpl[] {
        return validateExampleUser(objectToValidate);
    }

    /**
     * Validate the entity before to insert it to the database. In this case checks for duplicated emails.
     * Given the validation is simple, you can program it without the need to code each db engine implementation.
     * @param objectToInsert
     * @return {Promise<ValidationErrorImpl[]>}
     */
    protected validateBeforeInsert<t>(objectToInsert: ExampleUser): Promise<ValidationErrorImpl[]> {
        return this.findOneByAttribute("email", objectToInsert.email)
            .then((result: ExampleUser) => {
                const errors: ValidationErrorImpl[] = [];
                if (!_.isNull(result)) {
                    errors.push(
                        new ValidationErrorImpl(
                            "email",
                            "There is an user with the same email address",
                            result.email));
                }
                return Promise.resolve(errors);
            });
    }

    /**
     * This method is not possible to code it here because it requires access to custom queries that are different
     * by each db engine.
     * In this case, we mark the method as abstract in order to be implemented for each db engine.
     * @param objectToUpdate
     */
    protected abstract validateBeforeUpdate<t>(objectToUpdate: ExampleUser): Promise<any>;

    protected convertBeforeSave(object: ExampleUser): any {
        this._logExampleUserDao.debug("Call to convertBeforeSave with object: %j", object);
        return {
            id: object[this.ID_REFERENCE],
            name: object.name,
            lastName: object.lastName,
            email: object.email,
            typeName: object.typeName
        };
    }

    protected convertAfterDbOperation(object: any): ExampleUser {
        const result = new ExampleUser(object.name, object.lastName, object.email);
        result[this.ID_REFERENCE] = object[this.ID_REFERENCE];
        return result;
    }
}
