/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as Promise from "bluebird";
import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {AttributeFilter} from "../../persistence/impl/attribute-filter";
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {StateProvinceEntity} from "./state-province-entity";
import {StateProvinceValidator} from "./state-province-validator";

export abstract class StateProvinceDao extends AbstractDataAccessObjectWithEngine<StateProvinceEntity> {

    private dbEngineUtilLocal: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.dbEngineUtilLocal = dbEngineUtil;
    }

    public findAllByIdCountry(idCountry: string) {
        return this.dbEngineUtilLocal.findAllByAttribute("idCountry", idCountry);
    }

    protected validateEntity<t>(objectToValidate: StateProvinceEntity): IValidationError[] {
        return StateProvinceValidator.validateStateProvince(objectToValidate);
    }

    protected validateBeforeInsert<t>(objectToInsert: StateProvinceEntity): Promise<IValidationError[]> {
        const filter: AttributeFilter[] = [
            new AttributeFilter("idCountry", objectToInsert.idCountry),
            new AttributeFilter("code", objectToInsert.code)
        ];
        return this.dbEngineUtilLocal.findAllByAttributesAndOperator(filter)
            .then((result) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        "code",
                        "There is another state province with the same code and the same country",
                        objectToInsert.code));
                }
                return Promise.resolve(errors);
            });
    }

    protected abstract validateBeforeUpdate<t>(objectToUpdate: StateProvinceEntity): Promise<IValidationError[]>;

}
