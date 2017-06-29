/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import * as _ from 'lodash';
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {MongoDbUtil} from "../../../persistence/util/mongodb-util.js";
import {isBlankString} from "../../../util/blank-string-validator";
import {IPartyEntity} from "../iParty-entity";
import {OrganizationEntity} from "../organization/organization-entity";
import {PartyDao} from "../party-dao";
import {PartyValidator} from "../party-validator";
import {PersonEntity} from "../person/person-entity";

export class PartyDaoMongoDbImpl extends PartyDao {

    private model: Model<any>;

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    protected validateBeforeUpdate(objectToUpdate: IPartyEntity): Promise<IValidationError[]> {
        return this.validateDuplicated(objectToUpdate);
    }

    protected validateDuplicated(objectToUpdate: IPartyEntity): Promise<IValidationError[]> {
        let emailAddressesToLookFor: string[];
        emailAddressesToLookFor = objectToUpdate.contact.emails.map((value, index, array) => value.address);
        let personReference: PersonEntity;
        let organizationReference: OrganizationEntity;
        let query: any;
        if (objectToUpdate.type === PartyValidator.PERSON) {
            personReference = objectToUpdate as PersonEntity;
            query = {
                $and: [
                    {_id: {$ne: objectToUpdate.id}},
                    {
                        $or: [
                            {"contact.emails.address": {$in: emailAddressesToLookFor}},
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
                    {_id: {$ne: objectToUpdate.id}},
                    {
                        $or: [
                            {"contact.emails.address": {$in: emailAddressesToLookFor}},
                            {name: {$eq: organizationReference.name}}
                        ]
                    }
                ]
            };
        }
        if (_.isUndefined(objectToUpdate.idAccount) === false) {
            query.$and[1].$or.push({idAccount: {$eq: objectToUpdate.idAccount}});
        }
        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((resultQuery: IPartyEntity[]) => {
                const errors: ValidationError[] = PartyValidator.validateDuplicatedRecords(resultQuery, emailAddressesToLookFor, objectToUpdate);
                return Promise.resolve(errors);
            });
    }
}
