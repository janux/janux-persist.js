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
import {CountryEntity} from "./country-entity";
import {CountryValidator} from "./country-validator";

export abstract class CountryDao extends AbstractDataAccessObjectWithEngine<CountryEntity> {

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    public findOneByIsoCode(isoCode: string) {
        return this.findOneByAttribute("isoCode", isoCode);
    }

    protected validateEntity<t>(objectToValidate: CountryEntity): IValidationError[] {
        return CountryValidator.validateCountry(objectToValidate);
    }

    protected validateBeforeInsert<t>(objectToInsert: CountryEntity): Promise<IValidationError[]> {
        const filter: AttributeFilter[] = [
            new AttributeFilter("name", objectToInsert.name),
            new AttributeFilter("isoCode", objectToInsert.isoCode),
        ];
        return this.findAllByAttributesOrOperator(filter)
            .then((result: CountryEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    if (result[0].name === objectToInsert.name) {
                        errors.push(new ValidationError(
                            "name",
                            "There is another country with the same name",
                            objectToInsert.name));
                    } else {
                        errors.push(new ValidationError("isoCode",
                            "There is another country with the same ISO code",
                            objectToInsert.name));
                    }
                }
                return Promise.resolve(errors);
            });
    }

    protected abstract validateBeforeUpdate<t>(objectToUpdate: CountryEntity): Promise<IValidationError[]>;
}
