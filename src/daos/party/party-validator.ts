/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import * as _ from 'lodash';
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlank} from "../../util/blank-string-validator";
import {PostalAddress} from "./contact/address/postal-address";
import {PostalAddressValidator} from "./contact/address/postal-address-validator";
import {IContactMethod} from "./contact/contact-method";
import {ContactValidator} from "./contact/contact-validator";
import {EmailAddress} from "./contact/email/email-address";
import {EmailValidator} from "./contact/email/email-address-validator";
import {PhoneNumber} from "./contact/phone/phone-number";
import {PhoneNumberValidator} from "./contact/phone/phone-number-validator";
import {IPartyEntity} from "./iParty-entity";
import {OrganizationEntity} from "./organization/organization-entity";
import {OrganizationValidator} from "./organization/organization-validator";
import {PersonEntity} from "./person/person-entity";
import {PersonValidator} from "./person/person-validator";

export class PartyValidator {

    public static readonly PERSON: string = "person";
    public static readonly ORGANIZATION: string = "organization";
    public static readonly CONTACTS_EMAILS = "contact.emails";
    public static readonly CONTACT_PHONE_NUMBER = "contacts.phoneNumbers";
    public static readonly TYPE: string = "type";
    public static readonly AT_LEAST_ONE_EMAIL = "You need to put at least one email";
    public static readonly CONTACT_ADDRESSES = "contacts.addresses";
    public static readonly TYPE_EMPTY = "Type is empty";
    public static readonly MORE_THAN_ONE_PRIMARY_CONTACT = "There is more than one contact marked as primary";
    public static readonly NO_PRIMARY_CONTACT = "There is no contact marked as primary";
    public static readonly ID_ACCOUNT = "idAccount";
    public static readonly DUPLICATED_EMAILS = "This party has duplicated email addresses";
    public static readonly ID_ACCOUNT_NOT_UNDEFINED = "idAccount must be undefined or not empty";

    public static validateParty(party: IPartyEntity): ValidationError[] {
        this._log.debug("Call to validateParty with party: %j", party);
        let errors: ValidationError[] = [];
        if (isBlank(party.type)) {
            errors.push(new ValidationError(this.TYPE, this.TYPE_EMPTY, ""));
        } else if (party.type !== this.PERSON && party.type !== this.ORGANIZATION) {
            errors.push(new ValidationError(
                this.TYPE,
                "Type is not " + this.PERSON + " or " + this.ORGANIZATION,
                ""));
        } else {
            errors = errors.concat(this.validateContactData(party));
            if (party.type === this.PERSON) {
                errors = errors.concat(PersonValidator.validatePerson(party as PersonEntity));
            } else {
                errors = errors.concat(OrganizationValidator.validateOrganization(party as OrganizationEntity));
            }
        }
        if (_.isUndefined(party.idAccount) === false && isBlank(party.idAccount) === true) {
            errors.push(new ValidationError(this.ID_ACCOUNT, this.ID_ACCOUNT_NOT_UNDEFINED, party.idAccount));
        }
        this._log.debug("Returning: %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("PartyValidator");

    private static validateContactData(party: IPartyEntity) {
        let errors: ValidationError[] = [];
        // Check there is at least one primary email
        if (party.contact.emails.length === 0) {
            errors.push(new ValidationError(this.CONTACTS_EMAILS, this.AT_LEAST_ONE_EMAIL, ""));
        } else {
            errors = errors.concat(this.validateEmailAddresses(party.contact.emails));
            errors = errors.concat(this.validatePhoneNumbers(party.contact.phones));
            errors = errors.concat(this.validatePostalAddresses(party.contact.addresses));
        }
        // Check there is only one primary email
        return errors;
    }

    private static validateEmailAddresses(emails: EmailAddress[]): ValidationError[] {
        let errors: ValidationError[] = [];
        const addresses: string[] = emails.map((value, index, array) => value.address);
        const uniqueAddresses: string[] = _.uniq(addresses);
        if (addresses.length !== uniqueAddresses.length) {
            errors.push(new ValidationError(this.CONTACTS_EMAILS, this.DUPLICATED_EMAILS, ""));
        }
        errors = errors.concat(this.checkOnlyOnePrimaryContact(this.CONTACTS_EMAILS, emails));
        for (const email of emails) {
            errors = errors.concat(EmailValidator.validateEmail(email));
        }
        return errors;
    }

    private static validatePhoneNumbers(phones: PhoneNumber[]) {
        let errors: ValidationError[] = [];
        if (phones.length > 0) {
            errors = errors.concat(this.checkOnlyOnePrimaryContact(this.CONTACT_PHONE_NUMBER, phones));
            for (const phone of phones) {
                errors = errors.concat(ContactValidator.validateBaseContactInfo(this.CONTACT_PHONE_NUMBER, phone));
                errors = errors.concat(PhoneNumberValidator.validatePhoneNumber(phone));
            }
        }
        return errors;
    }

    private static validatePostalAddresses(addresses: PostalAddress[]) {
        let errors: ValidationError[] = [];
        if (addresses.length > 0) {
            errors = errors.concat(this.checkOnlyOnePrimaryContact(this.CONTACT_ADDRESSES, addresses));
            for (const address of addresses) {
                errors = errors.concat(ContactValidator.validateBaseContactInfo(this.CONTACT_ADDRESSES, address));
                errors = errors.concat(PostalAddressValidator.validatePostalAddress(address));
            }
        }
        return errors;
    }

    private static checkOnlyOnePrimaryContact(prefix: string, contacts: IContactMethod[]): ValidationError[] {
        this._log.debug("Call to checkOnlyOnePrimaryContact with prefix: %j contacts: %j", prefix, contacts);
        const errors: ValidationError[] = [];
        if (contacts.length > 0) {
            let primaryRecords: IContactMethod[];
            primaryRecords = _.filter(contacts, (o) => {
                return o.primary === true;
            });
            if (primaryRecords.length > 1) {
                errors.push(new ValidationError(prefix, this.MORE_THAN_ONE_PRIMARY_CONTACT, ""));
            } else if (primaryRecords.length === 0) {
                errors.push(new ValidationError(prefix, this.NO_PRIMARY_CONTACT, ""));
            }
        }
        return errors;
    }
}
