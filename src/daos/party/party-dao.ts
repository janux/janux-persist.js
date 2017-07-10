/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import * as _ from 'lodash';
import * as logger from 'log4js';
import {AbstractDataAccessObjectWithEngine} from "../../persistence/impl/abstract-data-access-object-with-engine";
import {IDbEngineUtil} from "../../persistence/interfaces/db-engine-util-method";
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {PartyValidator} from "./party-validator";
import JanuxPeople = require("janux-people.js");
import {CircularReferenceDetector} from "../../util/circular-reference-detector/circular-reference-detector";

export abstract class PartyDao extends AbstractDataAccessObjectWithEngine<JanuxPeople.Person| JanuxPeople.Organization> {

    private partyDaoLogger = logger.getLogger("PartyDao");
    private localDbEngineUtil: IDbEngineUtil;

    constructor(dbEngineUtil: IDbEngineUtil, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.localDbEngineUtil = dbEngineUtil;
    }

    /**
     * Find all people
     * @return {Promise<any[]>} The records
     */
    public findAllPeople(): Promise<JanuxPeople.Person[] | JanuxPeople.Organization[]> {
        return this.localDbEngineUtil.findAllByAttribute("typeName", PartyValidator.PERSON);
    }

    /**
     * Find all organizations
     * @return {Promise<any[]>} The records.
     */
    public findAllOrganizations(): Promise<JanuxPeople.Person[] | JanuxPeople.Organization[]> {
        return this.localDbEngineUtil.findAllByAttribute("typeName", PartyValidator.ORGANIZATION);
    }

    protected validateEntity<t>(objectToValidate: JanuxPeople.Person | JanuxPeople.Organization): IValidationError[] {
        return PartyValidator.validateParty(objectToValidate);
    }

    protected validateBeforeInsert(objectToInsert: JanuxPeople.Person | JanuxPeople.Organization): Promise<IValidationError[]> {
        // let emailAddressesToLookFor: string[];
        // let personReference: JanuxPeople.PersonImpl;
        // let organizationReference: JanuxPeople.OrganizationImpl;
        // let query: any;
        // emailAddressesToLookFor = objectToInsert.emailAddresses(false).map((value) => value.address);
        // if (objectToInsert.typeName === PartyValidator.PERSON) {
        //    personReference = objectToInsert as JanuxPeople.PersonImpl;
        //    query = {
        //        $or: [
        //            {"emails.address": {$in: emailAddressesToLookFor}},
        //            {
        //                $and: [
        //                    {"name.first": {$eq: personReference.name.first}},
        //                    {"name.middle": {$eq: personReference.name.middle}},
        //                ]
        //            }
        //        ]
        //
        //    };
        //
        //    if (isBlankString(personReference.name.last) === false) {
        //        query.$or[1].$and.push({"name.last": {$eq: personReference.name.last}});
        //    }
        // } else {
        //    organizationReference = objectToInsert as JanuxPeople.OrganizationImpl;
        //    query = {
        //        $or: [
        //            {"emails.address": {$in: emailAddressesToLookFor}},
        //            {name: {$eq: organizationReference.name}}
        //        ]
        //    };
        // }
        //
        // return this.dbEngineUtil.findAllByQuery(query)
        //    .then((resultQuery: IPartyEntity[]) => {
        //        const errors: ValidationError[] = PartyValidator.validateDuplicatedRecords(resultQuery, emailAddressesToLookFor, objectToInsert);
        //        return Promise.resolve(errors);
        //    });
        return Promise.resolve([]);
    }

    protected convertBeforeSave(object: JanuxPeople.Person | JanuxPeople.Organization): any {
        this.partyDaoLogger.debug("Call to convertBeforeSave with object: %j ", object);
        CircularReferenceDetector.detectCircularReferences(object);
        let result: any = object.toJSON();

        // For some reason , PersonImpl an OrganizationImpl has circular references. In order to remove the circular
        // references we do JSON.parse(JSON.stringify(object)). With this we avoid to crash mongoose.
        result = JSON.parse(JSON.stringify(result));
        result.typeName = object.typeName;
        this.partyDaoLogger.debug("Returning %j", result);
        return result;
    }

    protected convertAfterDbOperation(object: any): JanuxPeople.Person | JanuxPeople.Organization {
        let result: any;
        if (object.typeName === PartyValidator.PERSON) {
            result = JanuxPeople.Person.fromJSON(object);
        } else {
            result = JanuxPeople.Organization.fromJSON(object);
        }
        return result;
    }
}
