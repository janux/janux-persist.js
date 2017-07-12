/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */
import * as Promise from "bluebird";
import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {AuthContextEntity} from "./auth-context-entity";
import {AuthContextValidator} from "./auth-context-validator";

export abstract class AuthContextDao extends AbstractDataAccessObjectWithEngine<AuthContextEntity> {

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    public findOneByName(name: string): Promise<AuthContextEntity> {
        return this.findOneByAttribute("name", name);
    }

    public findAllByIdDisplayName(idDisplayName: string): Promise<AuthContextEntity[]> {
        return this.findAllByAttribute("idDisplayName", idDisplayName);
    }

    /**
     * Find all auth context whose name belongs to the list
     * @param names
     */
    public findAllByNamesIn(names: string[]): Promise<AuthContextEntity[]> {
        return this.findAllByAttributeNameIn("name", names);
    }

    protected  validateBeforeInsert(objectToInsert: AuthContextEntity): Promise<IValidationError[]> {
        return this.findOneByAttribute("name", objectToInsert.name)
            .then((result) => {
                const errors: ValidationError[] = [];
                if (result != null) {
                    errors.push(new ValidationError(
                        "name",
                        "There is another auth context with the same name",
                        objectToInsert.name));
                }
                return Promise.resolve(errors);
            });
    }

    protected abstract validateBeforeUpdate(objectToUpdate: AuthContextEntity): Promise<IValidationError[]>;

    protected validateEntity(objectToValidate: AuthContextEntity): IValidationError[] {
        return AuthContextValidator.validateAuthContext(objectToValidate);
    }
}
