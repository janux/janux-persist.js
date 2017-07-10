/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as Promise from "bluebird";
import * as _ from 'lodash';
import * as logger from 'log4js';
import {PartyValidator} from "../../daos/party/party-validator";
import {Persistence} from "../../daos/persistence";
import {UserEntity} from "../../daos/user/user-entity";
import {UserValidator} from "../../daos/user/user-valdiator";
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import JanuxPeople = require("janux-people.js");

export class UserService {

    public static PARTY = "party";
    public static NO_CONTACT_IN_DATABASE = "There is no contact in the database with this id";
    public static ACCOUNT = "account";
    public static ANOTHER_ACCOUNT_USING_CONTACT = "There is another account using this contact";
    public static ACCOUNT_NOT_IN_DATABASE = "The account with this id does not exist in the database";
    public static PARTY_TYPE = "party.type";

    public static findAll(): Promise<any> {
        this._log.debug("Call to findAll");
        let result: any;
        return Persistence.userDao.findAll()
            .then((users: UserEntity[]) => {
                result = users;
                const contactIds = users.map((value) => value.contactId);
                return Persistence.partyDao.findAllByIds(contactIds);
            })
            .then((contacts: JanuxPeople.Person[] | JanuxPeople.Organization[]) => {
                result = this.mixData(result, contacts);
                return Promise.resolve(result);
            });
    }

    /**
     * Insert a new user.
     * @param object The account info to insert.
     * object must have contact info.
     * If the contact info has an id. The system assumes
     * the account is going to be used by an existing party record.
     * If the contact info doesn't hav an id. The the system
     * assumes is going to insert a new party record.
     */
    public static insert(object: any): Promise<any> {
        this._log.debug("Call to insert with object %j", object);
        let associatedParty: JanuxPeople.Person | JanuxPeople.Organization;
        let result: any;
        const user: UserEntity = new UserEntity();
        user.enabled = object.enabled;
        user.userId = object.userId;
        user.mdate = object.mdate;
        user.cdate = object.cdate;
        user.username = object.username;
        user.password = object.password;
        user.expirePassword = object.expirePassword;
        user.expire = object.expire;
        user.locked = object.locked;
        user.roles = object.roles;

        // Validate user
        const errors = UserValidator.validateAccountExceptContactId(user);
        if (errors.length > 0) {
            return Promise.reject(errors);
        }

        return this.definePartyInfo(object.contact)
            .then((party: JanuxPeople.Person | JanuxPeople.Organization) => {
                associatedParty = party;
                user.contactId = associatedParty[this.ID_REFERENCE];
                return Persistence.userDao.insert(user);
            })
            .then((insertedAccount: UserEntity) => {
                result = insertedAccount;
                result.contact = associatedParty.toJSON();
                result.contact.id = associatedParty.id;
                result.contact.typeName = associatedParty.typeName;
                this._log.debug("Returning %j", result);
                return Promise.resolve(result);
            });
    }

    /**
     * Update the account data. Just update the account info and the associated roles.
     * One difference with insert is the update will not update the contact data.
     * Instead one must use partyDao.update().
     * @param object The account to be updated.
     */
    public static update(object: any): Promise<any> {
        this._log.debug("Call to update with object:%j", object);
        let result: any;
        const user: UserEntity = new UserEntity();
        // Find the user. This also helps to retrieve the contactId.
        return Persistence.userDao.findOneById(object.id)
            .then((resultQuery) => {
                if (resultQuery === null) {
                    return Promise.reject([
                        new ValidationError(this.ACCOUNT, this.ACCOUNT_NOT_IN_DATABASE, object.id)
                    ]);
                } else {
                    user.enabled = object.enabled;
                    user.username = object.username;
                    user.password = object.password;
                    user.expirePassword = object.expirePassword;
                    user.expire = object.expire;
                    user.locked = object.locked;
                    user.userId = object.userId;
                    user.mdate = object.mdate;
                    user.cdate = object.cdate;
                    user.roles = object.roles;
                    user.id = object.id;
                    user.contactId = resultQuery.contactId;
                    return Persistence.userDao.update(user);
                }
            })
            .then((updatedAccount: UserEntity) => {
                result = updatedAccount;
                // Now update the contact data.
                const contact: any = object.contact;
                let objectToUpdate: any;
                if (contact.typeName === PartyValidator.PERSON) {
                    objectToUpdate = JanuxPeople.Person.fromJSON(contact);
                } else {
                    objectToUpdate = JanuxPeople.Organization.fromJSON(contact);
                }
                objectToUpdate.id = contact.id;
                return Persistence.partyDao.update(objectToUpdate);
            })
            .then((updatedParty: any) => {
                result.contact = updatedParty.toJSON();
                result.contact.typeName = updatedParty.typeName;
                return Promise.resolve(result);
            });
    }

    private static _log = logger.getLogger("UserService");
    private static ID_REFERENCE: string = "id";

    private static mixData(users: any[], contacts: JanuxPeople.Person[] | JanuxPeople.Organization[]) {
        for (const user of users) {
            user.contact = _.find(contacts, (o) => {
                return o.id === user.contactId;
            });
        }
        return users;
    }

    /**
     * Validate the contact info before inserting the account.
     * @param party The party to validate.
     * @return {any}
     */
    private static definePartyInfo(party: any): Promise<JanuxPeople.Person | JanuxPeople.Organization | ValidationError[]> {
        this._log.debug("Call to define party  info with party: %j", party);
        let person: JanuxPeople.Person;
        let organization: JanuxPeople.Organization;
        // Check for an id
        if (isBlankString(party.id) === true) {
            // No id. Check port party type before inserting a new party.
            if (_.isString(party.typeName) && party.typeName === PartyValidator.PERSON) {
                person = JanuxPeople.Person.fromJSON(party);
                this._log.debug("Inserting the person %j", person);
                return Persistence.partyDao.insert(person);
            } else if (_.isString(party.typeName) && party.typeName === PartyValidator.ORGANIZATION) {
                // Itś an organization
                organization = JanuxPeople.Organization.fromJSON(party);
                // Insert the organization.
                this._log.debug("Inserting the organization %j", organization);
                return Persistence.partyDao.insert(organization);
            } else {
                this._log.warn("No correct party type, returning a reject");
                // No party type, sending an error.
                return Promise.reject([
                    new ValidationError(this.PARTY_TYPE, PartyValidator.TYPE_NOT_PERSON_OR_ORGANIZATION, "")
                ]);
            }

        } else {
            this._log.debug("The account to insert has a contact id");
            let referenceObject: JanuxPeople.Person | JanuxPeople.Organization;
            // Look for if there is a party with the same id
            return Persistence.partyDao.findOneById(party.id)
                .then((resultQueryParty: JanuxPeople.Person | JanuxPeople.Organization) => {
                    if (_.isNull(resultQueryParty)) {
                        this._log.warn("The id %j does not exist in the database", party.id);
                        return Promise.reject([
                            new ValidationError(this.PARTY, this.NO_CONTACT_IN_DATABASE, party.id)
                        ]);
                    } else {
                        referenceObject = resultQueryParty;
                        // Check if there is another account using this contact info.
                        return Persistence.userDao.findOneByContactId(resultQueryParty[this.ID_REFERENCE]);
                    }
                })
                .then((resultQueryAccount: UserEntity) => {
                    if (_.isNull(resultQueryAccount)) {
                        this._log.debug("Returning %j", resultQueryAccount);
                        return Promise.resolve(referenceObject);
                    } else {
                        this._log.warn("The contact founded has an associated account");
                        return Promise.reject([
                            new ValidationError(this.ACCOUNT, this.ANOTHER_ACCOUNT_USING_CONTACT, "")
                        ]);
                    }
                });
        }
    }
}
