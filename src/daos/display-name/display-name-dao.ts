/**
 * Project janux-persistence
 * Created by ernesto on 6/14/17.
 */
import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {DisplayNameEntity} from "./display-name-entity";
import Promise = require("bluebird");
import {IDbEngineUtil} from "../../index";
import {ValidationError} from "../../persistence/impl/validation-error";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {DisplayNameValidator} from "./display-name-validation";

export abstract class DisplayNameDao extends AbstractDataAccessObjectWithEngine<DisplayNameEntity> {

    private dbEngineUtilDao: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.dbEngineUtilDao = this.dbEngineUtil;
    }

    public  findOneByName(name: string): Promise<DisplayNameEntity> {
        return this.dbEngineUtilDao.findOneByAttribute("displayName", name);
    }

    protected validateEntity(objectToValidate: DisplayNameEntity): IValidationError[] {
        return DisplayNameValidator.validateDisplayName(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: DisplayNameEntity): Promise<IValidationError[]> {
        return this.findOneByAttribute("displayName", objectToInsert.displayName)
            .then((result) => {
                const errors: ValidationError[] = [];
                if (result != null) {
                    errors.push(
                        new ValidationError(
                            "displayName",
                            "There is another display name with the same name",
                            objectToInsert.displayName));
                }
                return Promise.resolve(errors);
            });
    }
}
