/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import {Model} from "mongoose";
import {MongoDbRepository} from "../../../persistence/impl/mongodb-repository";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {PartyDao} from "../party-dao";
import JanuxPeople = require("janux-people.js");
import {PartyValidator} from "../party-validator";

/**
 * Implementation of the PartyDao for the mongodb database.
 */
export class PartyDaoMongoDbImpl extends PartyDao {

    private model: Model<any>;

    constructor(dbEngineUtil: MongoDbRepository, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    /**
     * Find all records that matches with the name.
     * @param name The name to look for.
     * @return {Promise<(JanuxPeople.Person|JanuxPeople.Organization)[]>} The objects that matches with the name.
     */
    public findAllByName(name: string): Promise<JanuxPeople.Person[] | JanuxPeople.Organization[]> {
        const regexpName = new RegExp(name, "i");
        const query = {
            $or: [
                {
                    $and: [
                        {
                            $or: [
                                {'name.first': regexpName},
                                {'name.middle': regexpName},
                                {'name.last': regexpName}
                            ]
                        },
                        {typeName: {$eq: PartyValidator.PERSON}}
                    ]
                },
                {
                    $and: [
                        {name: regexpName},
                        {typeName: {$eq: PartyValidator.ORGANIZATION}}
                    ]
                }
            ]
        };
        return this.findAllByQuery(query);
    }

    protected validateBeforeUpdate(objectToUpdate: JanuxPeople.Person | JanuxPeople.Organization): Promise<IValidationError[]> {
        return this.validateDuplicated(objectToUpdate);
    }

    protected validateDuplicated(objectToUpdate: JanuxPeople.Person | JanuxPeople.Organization): Promise<IValidationError[]> {
        /*let emailAddressesToLookFor: string[];
         emailAddressesToLookFor = objectToUpdate.emailAddresses(false).map((value) => value.address);
         let personReference: JanuxPeople.PersonImpl;
         let organizationReference: JanuxPeople.OrganizationImpl;
         let query: any;
         if (objectToUpdate.typeName === PartyValidator.PERSON) {
         personReference = objectToUpdate as JanuxPeople.PersonImpl;
         query = {
         $and: [
         {_id: {$ne: objectToUpdate[this.ID_REFERENCE]}},
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
         {_id: {$ne: objectToUpdate.id}},
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
         return MongoDbUtil.findAllByQuery(this.model, query)
         .then((resultQuery: IPartyEntity[]) => {
         const errors: ValidationError[] = PartyValidator.validateDuplicatedRecords(resultQuery, emailAddressesToLookFor, objectToUpdate);
         return Promise.resolve(errors);
         });*/
        return Promise.resolve([]);
    }
}
