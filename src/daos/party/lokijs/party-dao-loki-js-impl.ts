/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {isBlankString} from "../../../util/blank-string-validator";
import {IPartyEntity} from "../iParty-entity";
import {OrganizationEntity} from "../organization/organization-entity";
import {PartyDao} from "../party-dao";
import {PartyValidator} from "../party-validator";
import {PersonEntity} from "../person/person-entity";

export class PartyDaoLokiJsImpl extends PartyDao {

    private collection: any;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.collection = dbEngineUtil.collection;
    }

    protected validateBeforeUpdate<t>(objectToUpdate: IPartyEntity): Promise<IValidationError[]> {
        return this.validateDuplicated(objectToUpdate);
    }

    private validateDuplicated<t>(objectToUpdate: IPartyEntity): Promise<IValidationError[]> {
        let emailAddressesToLookFor: string[];
        emailAddressesToLookFor = objectToUpdate.emails.map((value, index, array) => value.address);
        let personReference: PersonEntity;
        let organizationReference: OrganizationEntity;
        let query: any;
        if (objectToUpdate.type === PartyValidator.PERSON) {
            personReference = objectToUpdate as PersonEntity;
            query = {
                $and: [
                    {$loki: {$ne: _.toNumber(objectToUpdate.id)}},
                    {
                        $or: [
                            {"emails.address": {$in: emailAddressesToLookFor}},
                            {
                                $and: [
                                    {"name.first": {$eq: personReference.name.first}},
                                    {"name.middle": {$eq: personReference.name.middle}},
                                ]
                            }
                        ]
                    }
                ]
            };
            if (isBlankString(personReference.name.last) === false) {
                query.$and[1].$or[1].$and.push({"name.last": {$eq: personReference.name.last}});
            }
        } else {
            organizationReference = objectToUpdate as OrganizationEntity;
            query = {
                $and: [
                    {$loki: {$ne: _.toNumber(objectToUpdate.id)}},
                    {
                        $or: [
                            {"emails.address": {$in: emailAddressesToLookFor}},
                            {name: {$eq: organizationReference.name}}
                        ]
                    }
                ]
            };
        }
        if (_.isUndefined(objectToUpdate.idAccount) === false) {
            query.$and[1].$or.push({idAccount: {$eq: objectToUpdate.idAccount}});
        }
        return LokiJsUtil.findAllByQuery(this.collection, query)
            .then((resultQuery: IPartyEntity[]) => {
                const errors: ValidationError[] = PartyValidator.validateDuplicatedRecords(resultQuery, emailAddressesToLookFor, objectToUpdate);
                return Promise.resolve(errors);
            });
    }

}
