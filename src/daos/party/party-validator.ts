/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import JanuxPeople = require("janux-people");
import * as _ from "lodash";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import * as logger from 'utils/logger-api/logger-api';
import {isBlankString} from "utils/string/blank-string-validator";
import {OrganizationValidator} from "./organization/organization-validator";
import {PersonValidator} from "./person/person-validator";

/**
 * Validates if the party has the correct values.
 */
export class PartyValidator {

	public static readonly PERSON: string = "PersonImpl";
	public static readonly ORGANIZATION: string = "OrganizationImpl";
	public static readonly STAFF: string = "StaffImplTest";
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
	public static readonly ID_ACCOUNT_DUPLICATE = "There is another record with the same idAccount";
	public static TYPE_NOT_PERSON_OR_ORGANIZATION = "Type is not person or organization";
	public static THERE_IS_ANOTHER_PARTY_WITH_SAME_EMAIL = "There is another record with the same email address";
	public static DISPLAY_NAME: string = "displayName";
	public static DISPLAY_NAME_EMPTY: string = "Display name is empty";

	/**
	 * Validate the entity.
	 * @param party
	 * @return {ValidationErrorImpl[]} A list of errors. If the record is valid. The the method returns an empty array.
	 */
	public static validateParty(party: JanuxPeople.PartyAbstract): ValidationErrorImpl[] {
		this._log.debug("Call to validateParty with party: %j", party);
		let errors: ValidationErrorImpl[] = [];
		if (isBlankString(party.typeName)) {
			errors.push(new ValidationErrorImpl(this.TYPE, this.TYPE_EMPTY, ""));
		} else if (party.typeName !== this.PERSON && party.typeName !== this.ORGANIZATION && party.typeName !== this.STAFF) {
			errors.push(new ValidationErrorImpl(
				this.TYPE,
				this.TYPE_NOT_PERSON_OR_ORGANIZATION,
				""));
		} else {
			errors = errors.concat(this.validateContactData(party));
			if (party.typeName === this.PERSON || party.typeName === this.STAFF) {
				errors = errors.concat(PersonValidator.validatePerson(party as JanuxPeople.Person));
			} else {
				errors = errors.concat(OrganizationValidator.validateOrganization(party as JanuxPeople.Organization));
			}
		}
		// TODO: Look for how to validate that.
		// if (isBlankString(party.displayName)) {
		//     errors.push(new ValidationErrorImpl(
		//         this.DISPLAY_NAME,
		//         this.DISPLAY_NAME_EMPTY,
		//         ""));
		// }

		this._log.debug("Returning: %j", errors);
		return errors;
	}

	/**
	 * Validate for duplicated records.
	 * @param resultQuery
	 * @param emailAddressesToLookFor
	 * @param reference
	 * @return {ValidationErrorImpl[]}
	 */
	public static validateDuplicatedRecords(resultQuery: JanuxPeople.PartyAbstract[], emailAddressesToLookFor: string[], reference: JanuxPeople.PartyAbstract): ValidationErrorImpl[] {
		this._log.debug(
			"Call to validateDuplicatedRecords with resultQuery: %j  emailAddressesToLookFor: %j reference : %j",
			resultQuery,
			emailAddressesToLookFor,
			resultQuery);
		const errors: ValidationErrorImpl[] = [];
		/*let person: PersonEntity;
         let organization: OrganizationEntity;
         let personReference: PersonEntity;
         let organizationReference: OrganizationEntity;
         if (reference.type === this.PERSON) {
         personReference = reference as PersonEntity;
         } else {
         organizationReference = reference as OrganizationEntity;
         }
         // Validating duplicated emails
         const potentialDuplicatedEmailRecords: string[] = _.flatMap(resultQuery, (record) => {
         return record.emails.map((value, index, array) => value.address);
         });
         const duplicatedEmails: string [] = _.intersection(emailAddressesToLookFor, potentialDuplicatedEmailRecords);
         for (const obj of duplicatedEmails) {
         errors.push(new ValidationErrorImpl(
         this.CONTACTS_EMAILS,
         this.THERE_IS_ANOTHER_PARTY_WITH_SAME_EMAIL,
         obj));
         }

         // Validate duplicated name
         for (const element of resultQuery) {

         // Validate duplicated idAccount
         if (element.idAccount === reference.idAccount && isBlankString(element.idAccount) === false) {
         errors.push(new ValidationErrorImpl(
         this.ID_ACCOUNT,
         this.ID_ACCOUNT_DUPLICATE,
         reference.idAccount
         ));
         }

         if (element.type === PartyValidator.PERSON && reference.type === element.type) {
         // Validate duplicated person name
         person = element as PersonEntity;
         if (PersonName.validateSameName(person.name, personReference.name) === true) {
         errors.push(new ValidationErrorImpl(
         PersonValidator.ATTRIBUTES,
         PersonValidator.PERSON_NAME_DUPLICATED,
         JSON.stringify(person.name)));
         }
         } else if (element.type === PartyValidator.ORGANIZATION && reference.type === element.type) {
         // Validate duplicated organization name
         organization = element as OrganizationEntity;
         if (organization.name === organizationReference.name) {
         errors.push(new ValidationErrorImpl(
         OrganizationValidator.ATTRIBUTES,
         OrganizationValidator.CODE_DUPLICATED,
         organization.name));
         }
         }
         }*/

		this._log.debug("Retuning errors: %j", errors);
		return errors;
	}

	private static _log = logger.getLogger("PartyValidator");

	/**
	 * Validate phones, postal addresses and emails data.
	 * @param party
	 * @return {ValidationErrorImpl[]} A list of errors. If the record is valid. The the method returns an empty array.
	 */
	private static validateContactData(party: JanuxPeople.PartyAbstract) {
		const errors: ValidationErrorImpl[] = [];

		// Validate boolean values.
		if (party['isSupplier'] != null && _.isBoolean(party['isSupplier']) === false) {
			errors.push(new ValidationErrorImpl(OrganizationValidator.IS_SUPPLIER, OrganizationValidator.MUST_BE_BOOLEAN, ""));
		}

		if (party['isReseller'] != null && _.isBoolean(party['isReseller']) === false) {
			errors.push(new ValidationErrorImpl(OrganizationValidator.IS_RESELLER, OrganizationValidator.MUST_BE_BOOLEAN, ""));
		}

		// Validate functions.
		if (party['functionsProvided'] != null && _.isArray(party['functionsProvided']) === false) {
			errors.push(new ValidationErrorImpl(OrganizationValidator.FUNCTIONS_PROVIDED, OrganizationValidator.NOT_ARRAY, ""));
		} else if (_.some(party['functionsProvided'], value => isBlankString(value) === true)) {
			errors.push(new ValidationErrorImpl(OrganizationValidator.FUNCTIONS_PROVIDED, OrganizationValidator.ELEMENT_NOT_STRING, ""));
		}

		// Check there is at least one primary email
		/*if (_.isArray(party.emailAddresses) === false || party.emailAddresses.length === 0) {
         errors.push(new ValidationErrorImpl(this.CONTACTS_EMAILS, this.AT_LEAST_ONE_EMAIL, ""));
         } else {
         errors = errors.concat(this.validateEmailAddresses(party.emailAddresses(false)));
         errors = errors.concat(this.validatePhoneNumbers(party.phoneNumbers(false)));
         errors = errors.concat(this.validatePostalAddresses(party.postalAddresses(false)));
         }*/
		// Check there is only one primary email
		return errors;
	}

	/**
	 * Validate for valid email address.
	 * @param emails The emails to validate.
	 * @return {ValidationErrorImpl[]} A list of errors. If the record is valid. The the method returns an empty array.
	 */
	private static validateEmailAddresses(emails: JanuxPeople.EmailAddress[]): ValidationErrorImpl[] {
		const errors: ValidationErrorImpl[] = [];
		/*const addresses: string[] = emails.map((value, index, array) => value.address);
         const uniqueAddresses: string[] = _.uniq(addresses);
         if (addresses.length !== uniqueAddresses.length) {
         errors.push(new ValidationErrorImpl(this.CONTACTS_EMAILS, this.DUPLICATED_EMAILS, ""));
         }
         errors = errors.concat(this.checkOnlyOnePrimaryContact(this.CONTACTS_EMAILS, emails));
         for (const email of emails) {
         errors = errors.concat(EmailValidator.validateEmail(email));
         }*/
		return errors;
	}

	private static validatePhoneNumbers(phones: JanuxPeople.PhoneNumber[]) {
		const errors: ValidationErrorImpl[] = [];
		/*if (_.isArray(phones) === false) {
         return errors;
         }
         if (phones.length > 0) {
         errors = errors.concat(this.checkOnlyOnePrimaryContact(this.CONTACT_PHONE_NUMBER, phones));
         for (const phone of phones) {
         errors = errors.concat(ContactValidator.validateBaseContactInfo(this.CONTACT_PHONE_NUMBER, phone));
         errors = errors.concat(PhoneNumberValidator.validatePhoneNumber(phone));
         }
         }*/
		return errors;
	}

	private static validatePostalAddresses(addresses: JanuxPeople.PostalAddress[]) {
		const errors: ValidationErrorImpl[] = [];
		/*if (_.isArray(addresses) === false) {
         return errors;
         }
         if (addresses.length > 0) {
         errors = errors.concat(this.checkOnlyOnePrimaryContact(this.CONTACT_ADDRESSES, addresses));
         for (const address of addresses) {
         errors = errors.concat(ContactValidator.validateBaseContactInfo(this.CONTACT_ADDRESSES, address));
         errors = errors.concat(PostalAddressValidator.validatePostalAddress(address));
         }
         }*/
		return errors;
	}

	private static checkOnlyOnePrimaryContact(prefix: string, contacts: JanuxPeople.EmailAddress | JanuxPeople.PhoneNumber | JanuxPeople.PostalAddress): ValidationErrorImpl[] {
		this._log.debug("Call to checkOnlyOnePrimaryContact with prefix: %j contacts: %j", prefix, contacts);
		const errors: ValidationErrorImpl[] = [];
		/*if (contacts.length > 0) {
         let primaryRecords: IContactMethod[];
         primaryRecords = _.filter(contacts, (o) => {
         return o.primary === true;
         });
         if (primaryRecords.length > 1) {
         errors.push(new ValidationErrorImpl(prefix, this.MORE_THAN_ONE_PRIMARY_CONTACT, ""));
         } else if (primaryRecords.length === 0) {
         errors.push(new ValidationErrorImpl(prefix, this.NO_PRIMARY_CONTACT, ""));
         }
         }*/
		return errors;
	}

}
