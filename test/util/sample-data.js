/**
 * Project janux-persist.js
 * Created by ernesto on 9/4/17.
 */

var Person = require("janux-people").Person;
var Organization = require("janux-people").Organization;
var EmailAddress = require("janux-people").EmailAddress;

function createPerson1() {
	const personName = "John";
	const personMiddleName = "Doe";
	const personLastName = "Doe";
	const contactEmail = "dev@glarus.com";
	const contactType = "work";
	var person = new Person();
	person.name.first = personName;
	person.name.middle = personMiddleName;
	person.name.last = personLastName;
	person.setContactMethod(contactType, new EmailAddress(contactEmail));
	return person;
}


function createPerson2() {
	const personName = "Jane";
	const personMiddleName = "Doe";
	const personLastName = "Doe";
	const contactEmail = "cms@glarus.com";
	const contactType = "home";
	var person = new Person();
	person.name.first = personName;
	person.name.middle = personMiddleName;
	person.name.last = personLastName;
	person.setContactMethod(contactType, new EmailAddress(contactEmail));
	return person;
}

function createOrganization1() {
	const organizationName = "Glarus";
	const organizationContactEmail = "sales@glarus.com";
	const contactType = "work";
	var organization = new Organization();
	organization.name = organizationName;
	organization.setContactMethod(contactType, new EmailAddress(organizationContactEmail));
	return organization;
}

function createEmptyUserAccount1() {
	const accountUsername = "username";
	const accountPassword = "password";
	const accountEnabled = true;
	const accountLocked = false;
	const accountExpire = undefined;
	const accountExpirePassword = undefined;
	return {
		username: accountUsername,
		password: accountPassword,
		enabled: accountEnabled,
		locked: accountLocked,
		expire: accountExpire,
		expirePassword: accountExpirePassword,
		contact: undefined,
		roles: [
			"ADMIN",
			"AUTH CONTEXT"
		]
	};
}

function createEmptyUserAccount2() {
	const accountUsername = "username2";
	const accountPassword = "password2";
	const accountEnabled = true;
	const accountLocked = false;
	const accountExpire = undefined;
	const accountExpirePassword = undefined;
	return {
		username: accountUsername,
		password: accountPassword,
		enabled: accountEnabled,
		locked: accountLocked,
		expire: accountExpire,
		expirePassword: accountExpirePassword,
		roles: [
			"USERS"
		]
	};
}

function createEmptyUserAccount3() {
	const accountUsername = "username3";
	const accountPassword = "password3";
	const accountEnabled = true;
	const accountLocked = false;
	const accountExpire = undefined;
	const accountExpirePassword = undefined;
	return {
		username: accountUsername,
		password: accountPassword,
		enabled: accountEnabled,
		locked: accountLocked,
		expire: accountExpire,
		expirePassword: accountExpirePassword,
		roles: [
			"USERS"
		]
	};
}


function createUser1() {
	var person = createPerson1();
	var account = createEmptyUserAccount1();
	var contactReference = person.toJSON();
	contactReference.typeName = person.typeName;
	account.contact = contactReference;
	return account;
}

function createUser2() {
	var person = createPerson2();
	var account = createEmptyUserAccount2();
	var contactReference = person.toJSON();
	contactReference.typeName = person.typeName;
	account.contact = contactReference;
	return account;
}

function createUser3() {
	var organization = createOrganization1();
	var account = createEmptyUserAccount3();
	var contactReference = organization.toJSON();
	contactReference.typeName = organization.typeName;
	account.contact = contactReference;
	return account;
}

module.exports = {
	createPerson1: createPerson1,
	createOrganization1: createOrganization1,
	createEmptyUserAccount1: createEmptyUserAccount1,
	createEmptyUserAccount2: createEmptyUserAccount2,
	createUser1: createUser1,
	createUser2: createUser2,
	createUser3: createUser3
};
