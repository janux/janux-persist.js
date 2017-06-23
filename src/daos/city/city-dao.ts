/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import * as Promise from "bluebird";
import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {AttributeFilter} from "../../persistence/impl/attribute-filter";
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {CityEntity} from "./city-entity";
import {CityValidator} from "./city-validator";

export abstract class CityDao extends AbstractDataAccessObjectWithEngine<CityEntity> {

    private dbEngineUtilLocal: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.dbEngineUtilLocal = dbEngineUtil;
    }

    protected validateEntity<t>(objectToValidate: CityEntity): IValidationError[] {
        return CityValidator.validateCity(objectToValidate);
    }

    protected  validateBeforeInsert<t>(objectToInsert: CityEntity): Promise<IValidationError[]> {
        const filter: AttributeFilter[] = [
            new AttributeFilter("code", objectToInsert.code),
            new AttributeFilter("idStateProvince", objectToInsert.idStateProvince)
        ];
        return this.dbEngineUtilLocal.findAllByAttributesAndOperator(filter)
            .then((result) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        "code",
                        "There is a city with the same code and the same state province",
                        objectToInsert.code));
                }
                return Promise.resolve(errors);
            });
    }

}
