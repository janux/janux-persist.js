/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as _ from "lodash";
import {DataAccessObjectWithEngine} from "../../persistence/impl/data-access-object-with-engine";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import Promise = require("bluebird");
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {ExampleUser} from "./example-user";
import {validateExampleUser} from "./example-validate-usert";

/**
 * This is the base dao class of the entity ExampleUser.
 */
export abstract class ExampleUserDao extends DataAccessObjectWithEngine<ExampleUser> {

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
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
                if (!_.isNull(result)) {
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
}
