/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import {DbEngineUtilLokijs} from "../../../persistence/impl/db-engine-util-lokijs";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {PartyDao} from "../party-dao";
import JanuxPeople = require("janux-people.js");
import {LokiJsUtil} from "../../../persistence/util/lokijs-util";
import {PartyValidator} from "../party-validator";

export class PartyDaoLokiJsImpl extends PartyDao {

    private collection: any;

    constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.collection = dbEngineUtil.collection;
    }

    public findAllByName(name: string): Promise<JanuxPeople.Person[] | JanuxPeople.Organization[]> {
        const query = {
            $or: [
                {
                    $and: [
                        {
                            $or: [
                                {'name.first': {$contains: name}},
                                {'name.middle': {$contains: name}},
                                {'name.last': {$contains: name}}
                            ]
                        },
                        {typeName: {$eq: PartyValidator.PERSON}}
                    ]
                },
                {
                    $and: [
                        {name: {$contains: name}},
                        {typeName: {$eq: PartyValidator.ORGANIZATION}}
                    ]
                }
            ]
        };
        return this.findAllByQuery(query);
    }

    protected validateBeforeUpdate<t>(objectToUpdate: JanuxPeople.Person | JanuxPeople.Organization): Promise<IValidationError[]> {
        return this.validateDuplicated(objectToUpdate);
    }

    private validateDuplicated<t>(objectToUpdate: JanuxPeople.Person | JanuxPeople.Organization): Promise<IValidationError[]> {
        /*let emailAddressesToLookFor: string[];
         emailAddressesToLookFor = objectToUpdate.emailAddresses(false).map((value, index, array) => value.address);
         let personReference: JanuxPeople.PersonImpl;
         let organizationReference: JanuxPeople.OrganizationImpl;
         let query: any;
         if (objectToUpdate.typeName === PartyValidator.PERSON) {
         personReference = objectToUpdate as JanuxPeople.PersonImpl;
         query = {
         $and: [
         {$loki: {$ne: _.toNumber(objectToUpdate[this.ID_REFERENCE])}},
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
         organizationReference = objectToUpdate as JanuxPeople.OrganizationImpl;
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
         return LokiJsUtil.findAllByQuery(this.collection, query)
         .then((resultQuery: IPartyEntity[]) => {
         const errors: ValidationError[] = PartyValidator.validateDuplicatedRecords(resultQuery, emailAddressesToLookFor, objectToUpdate);
         return Promise.resolve(errors);
         });*/

        return Promise.resolve([]);
    }

}
