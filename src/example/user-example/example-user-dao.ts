/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as Promise from "bluebird";
import * as logger from 'log4js';
import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {ValidationError} from "../../persistence/impl/validation-error";
import {ICrudMethods} from "../../persistence/interfaces/crud-methods";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {ExampleUser} from "./example-user";
import {validateExampleUser} from "./example-validate-usert";

/**
 * This is the base dao class of the entity ExampleUser.
 */
export abstract class ExampleUserDao extends AbstractDataAccessObjectWithEngine<ExampleUser> {

    private _logExampleUserDao = logger.getLogger("ExampleUserDao");

    constructor(dbEngineUtil: ICrudMethods, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    /**
     * Find all users by a last name.
     * This is an example method where you can implement the query without the need to implement it for each db engine
     * @param lastName
     * @return {Promise<ExampleUser[]>}
     */
    public findAllByLastName(lastName: string): Promise<ExampleUser[]> {
        return this.findAllByAttribute("lastName", lastName);
    }

    /**
     * This is a method where you need to implement it for every db engine.
     * @param name
     */
    public abstract findAllByNameMatch(name: string): Promise<ExampleUser[]>;

    protected validateEntity<t>(objectToValidate: ExampleUser): IValidationError[] {
        return validateExampleUser(objectToValidate);
    }

    /**
     * Validate the entity before to insert it to the database. In this case checks for duplicated emails.
     * Given the validation is simple, you can program it without the need to code each db engine implementation.
     * @param objectToInsert
     * @return {Promise<ValidationError[]>}
     */
    protected validateBeforeInsert<t>(objectToInsert: ExampleUser): Promise<IValidationError[]> {
        return this.findOneByAttribute("email", objectToInsert.email)
            .then((result: ExampleUser) => {
                const errors: ValidationError[] = [];
                if (result != null) {
                    errors.push(
                        new ValidationError(
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
