/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as Promise from "bluebird";
import * as logger from 'log4js';
import {AbstractDataAccessObjectWithAdapter} from "../../persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {PartyValidator} from "./party-validator";
import JanuxPeople = require("janux-people.js");
import {DbAdapter} from "../../persistence/api/dn-adapters/db-adapter";
import {EntityPropertiesImpl} from "../../persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "../../persistence/implementations/dao/validation-error";

/**
 * This is the base class of the partyDao. In this class we define the object we are going to use
 *  is JanuxPeople.Person or JanuxPeople.Organization.
 */
export abstract class PartyDao extends AbstractDataAccessObjectWithAdapter<JanuxPeople.Person | JanuxPeople.Organization> {

    private partyDaoLogger = logger.getLogger("PartyDao");

    constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
        super(dbAdapter, entityProperties);
    }

    /**
     * Find all record that matches with the name,
     * Because this method handles complex queries. This method must be implement per each db engine.
     * @param name The name to look for.
     * @return A list of parties that matches with the name.
     */
    public abstract findByName(name: string): Promise<JanuxPeople.Person[] | JanuxPeople.Organization[]>;

    /**
     * Find all records that has the email address.
     * @param email The email address to look for.
     * @return {Promise<(JanuxPeople.Person|JanuxPeople.Organization)[]>} A list of parties that matches with the name.
     */
    public findByEmail(email: string): Promise<JanuxPeople.Person[] | JanuxPeople.Organization[]> {
        return this.findByAttribute("emails.address", email);
    }

    /**
     * Find all records that hast the phone number.
     * @param phone The phone number to look for.
     * @return {Promise<(JanuxPeople.Person|JanuxPeople.Organization)[]>} A list of parties that matches with the
     * criteria.
     */
    public findByPhone(phone: string) {
        return this.findByAttribute("phones.number", phone);
    }

    /**
     * Find all people
     * @return {Promise<any[]>} The records
     */
    public findPeople(): Promise<JanuxPeople.Person[] | JanuxPeople.Organization[]> {
        return this.findByAttribute("typeName", PartyValidator.PERSON);
    }

    /**
     * Find all organizations
     * @return {Promise<any[]>} The records.
     */
    public findOrganizations(): Promise<JanuxPeople.Person[] | JanuxPeople.Organization[]> {
        return this.findByAttribute("typeName", PartyValidator.ORGANIZATION);
    }

    /**
     * Implementation of the method validateEntity.
     * @param objectToValidate The object to validate.
     * @return {ValidationErrorImpl[]} An array containing the validation errors. If there are no errors then
     * returns an empty array.
     */
    protected validateEntity<t>(objectToValidate: JanuxPeople.Person | JanuxPeople.Organization): ValidationErrorImpl[] {
        return PartyValidator.validateParty(objectToValidate);
    }

    /**
     * Validate the record is valid before inserting to the database.
     * @param objectToInsert The object to validate.
     * @return {Promise<Array>} An array containing the validation errors. If there are no errors then
     * returns an empty array.
     */
    protected validateBeforeInsert(objectToInsert: JanuxPeople.Person | JanuxPeople.Organization): Promise<ValidationErrorImpl[]> {
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
        // return this.dbAdapter.findByQuery(query)
        //    .then((resultQuery: IPartyEntity[]) => {
        //        const errors: ValidationErrorImpl[] = PartyValidator.validateDuplicatedRecords(resultQuery, emailAddressesToLookFor, objectToInsert);
        //        return Promise.resolve(errors);
        //    });
        return Promise.resolve([]);
    }

    /**
     * Transforms the object before inserting or updating the database.
     * In this case JanuxPeople.Person JanuxPeople.Organization has a method called toJSON.
     * We are going to use this method.
     * @param object The object to transforms.
     * @return {any} the transformed object.
     */
    protected convertBeforeSave(object: JanuxPeople.Person | JanuxPeople.Organization): any {
        this.partyDaoLogger.debug("Call to convertBeforeSave with object: %j ", object);
        let result: any = object.toJSON();

        // For some reason , PersonImpl an OrganizationImpl has circular references. In order to remove the circular
        // references we do JSON.parse(JSON.stringify(object)). With this we avoid to crash mongoose.
        result = JSON.parse(JSON.stringify(result));
        result.typeName = object.typeName;
        this.partyDaoLogger.debug("Returning %j", result);
        return result;
    }

    /**
     * Convert the object to a JanuxPeople.Person or a JanuxPeople.Organization.
     * @param object The data retrieved form the database.
     * @return {any} Ans instance of JanuxPeople.Person or JanuxPeople.Organization.
     */
    protected convertAfterDbOperation(object: any): JanuxPeople.Person | JanuxPeople.Organization {
        let result: any;
        if (object.typeName === PartyValidator.PERSON) {
            result = JanuxPeople.Person.fromJSON(object);
        } else {
            result = JanuxPeople.Organization.fromJSON(object);
        }
        result.id = object.id;
        return result;
    }
}
