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
import {isBlankString} from "../../util/blank-string-validator";
import {IPartyEntity} from "./iParty-entity";
import {OrganizationEntity} from "./organization/organization-entity";
import {PartyValidator} from "./party-validator";
import {PersonEntity} from "./person/person-entity";

export abstract class PartyDao extends AbstractDataAccessObjectWithEngine<IPartyEntity> {

    private localDbEngineUtil: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.localDbEngineUtil = dbEngineUtil;
    }

    /**
     * Find all people
     * @return {Promise<any[]>} The records
     */
    public findAllPeople(): Promise<IPartyEntity[]> {
        return this.localDbEngineUtil.findAllByAttribute("type", PartyValidator.PERSON);
    }

    /**
     * Find all organizations
     * @return {Promise<any[]>} The records.
     */
    public findAllOrganizations(): Promise<IPartyEntity[]> {
        return this.localDbEngineUtil.findAllByAttribute("type", PartyValidator.ORGANIZATION);
    }

    /**
     * Find both people and organizations that has an accountID
     * @return {ValidationError[]} The parties that has a defined idAccount.
     */
    public findAllAccounts(): Promise<IPartyEntity[]> {
        const query = {
            idAccount: {$ne: undefined}
        };
        return this.localDbEngineUtil.findAllByQuery(query);
    }

    protected validateEntity<t>(objectToValidate: IPartyEntity): IValidationError[] {
        return PartyValidator.validateParty(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: IPartyEntity): Promise<IValidationError[]> {
        let emailAddressesToLookFor: string[];
        let personReference: PersonEntity;
        let organizationReference: OrganizationEntity;
        let query: any;
        emailAddressesToLookFor = objectToInsert.contact.emails.map((value, index, array) => value.address);
        if (objectToInsert.type === PartyValidator.PERSON) {
            personReference = objectToInsert as PersonEntity;
            query = {
                $or: [
                    {"contact.emails.address": {$in: emailAddressesToLookFor}},
                    {
                        $and: [
                            {"name.first": {$eq: personReference.name.first}},
                            {"name.middle": {$eq: personReference.name.middle}},
                        ]
                    }
                ]

            };

            if (isBlankString(personReference.name.last) === false) {
                query.$or[1].$and.push({"name.last": {$eq: personReference.name.last}});
            }
        } else {
            organizationReference = objectToInsert as OrganizationEntity;
            query = {
                $or: [
                    {"contact.emails.address": {$in: emailAddressesToLookFor}},
                    {name: {$eq: organizationReference.name}}
                ]
            };
        }

        if (_.isUndefined(objectToInsert.idAccount) === false) {
            query.$or.push({idAccount: {$eq: objectToInsert.idAccount}});
        }

        return this.dbEngineUtil.findAllByQuery(query)
            .then((resultQuery: IPartyEntity[]) => {
                const errors: ValidationError[] = PartyValidator.validateDuplicatedRecords(resultQuery, emailAddressesToLookFor, objectToInsert);
                return Promise.resolve(errors);
            });
    }
}
