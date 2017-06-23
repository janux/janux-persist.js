/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {ValidationError} from "../../persistence/impl/validation-error";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {IPartyEntity} from "./iParty-entity";
import {PartyValidator} from "./party-validator";

export abstract class PartyDao extends AbstractDataAccessObjectWithEngine<IPartyEntity> {

    private localDbEngineUtil: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.localDbEngineUtil = dbEngineUtil;
    }

    public findAllPeople(): Promise<IPartyEntity[]> {
        return this.localDbEngineUtil.findAllByAttribute("type", PartyValidator.PERSON);
    }

    public findAllOrganizations(): Promise<IPartyEntity[]> {
        return this.localDbEngineUtil.findAllByAttribute("type", PartyValidator.ORGANIZATION);
    }

    protected validateEntity<t>(objectToValidate: IPartyEntity): IValidationError[] {
        return PartyValidator.validateParty(objectToValidate);
    }

    protected validateBeforeInsert<t>(objectToInsert: IPartyEntity): Promise<IValidationError[]> {
        let emailAddressesToLookFor: string[];
        emailAddressesToLookFor = objectToInsert.contact.emails.map((value, index, array) => value.address);
        return this.localDbEngineUtil.findAllByAttributeNameIn("contact.emails.address", emailAddressesToLookFor)
            .then((resultQuery: IPartyEntity[]) => {
                const errors: ValidationError[] = [];
                const potentialDuplicatedRecord: string[] = _.flatMap(resultQuery, (record) => {
                    return record.contact.emails.map((value, index, array) => value.address);
                });
                const duplicatedEmails: string [] = _.intersection(emailAddressesToLookFor, potentialDuplicatedRecord);
                for (const obj of duplicatedEmails) {
                    errors.push(new ValidationError(
                        "contact.emails",
                        "There is another record with the same email address",
                        obj));
                }
                return Promise.resolve(errors);
            });
    }
}
