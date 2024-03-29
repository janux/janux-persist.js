/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as Promise from "bluebird";
import {PartyValidator} from "daos/party/party-validator";
import {AccountDao} from "daos/user/account-dao";
import {AccountEntity} from "daos/user/account-entity";
import {AccountValidator} from "daos/user/account-validator";
import * as JanuxPeople from "janux-people";
import * as _ from "lodash";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {PartyServiceImpl} from "services/party/impl/party-service-impl";
import {PasswordService} from "services/password/PasswordService";
import {DateUtil} from "utils/date/date-util";
import * as logger from "utils/logger-api/logger-api";
import {isBlankString} from "utils/string/blank-string-validator";
import * as uuid from "uuid";

/**
 * This class has basic user service methods.
 */
export class UserService {
	public static createInstance(
		accountDao: AccountDao,
		partyService: PartyServiceImpl,
		passwordService: PasswordService
	) {
		return this._instance || (this._instance = new this(accountDao, partyService, passwordService));
	}

	private static _instance: UserService;
	public PARTY = "party";
	public NO_CONTACT_IN_DATABASE = "There is no contact in the database with this id";
	public ACCOUNT = "account";
	public ANOTHER_ACCOUNT_USING_CONTACT = "There is another account using this contact";
	public ACCOUNT_NOT_IN_DATABASE = "The account with this id does not exist in the database";
	public PARTY_TYPE = "party.type";
	private _log = logger.getLogger("UserService");
	private ID_REFERENCE: string = "id";
	private accountDao: AccountDao;
	private partyService: PartyServiceImpl;
	private passwordService: PasswordService;

	private constructor(accountDao: AccountDao, partyService: PartyServiceImpl, passwordService: PasswordService) {
		this.accountDao = accountDao;
		this.partyService = partyService;
		this.passwordService = passwordService;
	}

	/**
	 * Delete an users, and it's party info, given the userId.
	 * @param userId The user id.
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteUserByUserId(userId: string): Promise<any> {
		this._log.debug("Call to deleteUserByUserId with userId: %j", userId);
		return this.accountDao.findOneByUserId(userId).then((resultQuery: AccountEntity) => {
			return this.accountDao.remove(resultQuery);
		});
	}

	/**
	 * Remove several accounts by its user ids.
	 * @param {string[]} userIds
	 * @return {Bluebird<any>}
	 */
	public deleteByUserIds(userIds: string[]): Promise<any> {
		this._log.debug("Call to deleteByUserIds with %j", userIds);
		return this.accountDao.findByContactIdsIn(userIds).then((resultQuery: AccountEntity[]) => {
			return this.accountDao.removeByIds(resultQuery.map(value => value.id));
		});
	}

	/**
	 * Save or updateMethod an users and it's contact info.
	 * @param object
	 * @return {Promise<any>}
	 */
	public saveOrUpdate(object: any): Promise<any> {
		this._log.debug("Call to saveOrUpdate with object: %j", object);
		if (isBlankString(object.id)) {
			return this.insert(object);
		} else {
			return this.update(object);
		}
	}

	/**
	 * Find all users and adds its contact info.
	 * @return {Promise<any[]>}
	 */
	public findAll(): Promise<any[]> {
		this._log.debug("Call to findAllMethod");
		return this.accountDao.findAll().then((users: AccountEntity[]) => {
			return this.populateContactData(users);
		});
	}

	/**
	 * Return all users given the ids.
	 * @param {string[]} ids
	 * @return {Bluebird<any[]>}
	 */
	public findByIdsIn(ids: string[]): Promise<any[]> {
		this._log.debug("Call to findByIdsIn with ids %j", ids);
		return this.accountDao.findByIds(ids).then((users: AccountEntity[]) => {
			return this.populateContactData(users);
		});
	}

	/**
	 *
	 * @param {string} contactId
	 * @returns {Bluebird<any>}
	 */
	public findOneByContactId(contactId: string): Promise<any> {
		this._log.debug("Call to findByContactId with contactId %j", contactId);
		return this.accountDao.findOneByContactId(contactId);
	}

	/**
	 * Find one user by its id.
	 * @param {string} id
	 * @return {Promise<any>}
	 */
	public findOneById(id: string): Promise<any> {
		this._log.debug("Call to findOneById with id: %j", id);
		let result: any;
		return this.accountDao
			.findOne(id)
			.then((user: AccountEntity) => {
				if (_.isNil(user)) {
					this._log.error("No user with the id " + id);
					return Promise.reject("No user with the id " + id);
				}
				result = user;
				return this.partyService.findOne(user.contactId);
			})
			.then((contact: JanuxPeople.PartyAbstract) => {
				result.contact = contact.toJSON();
				result.contact.id = contact["id"];
				result.contact.typeName = contact.typeName;
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Find one user by its userId.
	 * @param id The id
	 * @return {Promise<any>}
	 */
	public findOneByUserId(id: any): Promise<any> {
		this._log.debug("Call to findOneByUserId with id: %j", id);
		let result: any;
		return this.accountDao
			.findOneByUserId(id)
			.then((user: AccountEntity) => {
				if (_.isNil(user)) return Promise.reject("No user with the id " + id);
				result = user;
				return this.partyService.findOne(user.contactId);
			})
			.then((contact: JanuxPeople.PartyAbstract) => {
				result.contact = contact.toJSON();
				result.contact.id = contact["id"];
				result.contact.typeName = contact.typeName;
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Find one user by its username.
	 * @param username
	 * @return {Promise<any>}
	 */
	public findOneByUserName(username: string): Promise<any> {
		this._log.debug("Call to findOneByUserName with username: %j", username);
		let result: any;
		return this.accountDao
			.findOneByUserName(username)
			.then((user: AccountEntity) => {
				if (_.isNil(user)) return Promise.reject("No user with the username " + username);
				result = user;
				return this.partyService.findOne(user.contactId);
			})
			.then((contact: JanuxPeople.PartyAbstract) => {
				result.contact = contact.toJSON();
				result.contact.id = contact["id"];
				result.contact.typeName = contact.typeName;
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 *
	 * @param username Filter all records given the username.
	 * @return {Promise<any[]>}
	 */
	public findAllByUserNameMatch(username: string): Promise<any[]> {
		this._log.debug("Call to findByUserNameMatch with username: %j", username);
		return this.accountDao.findByUserNameMatch(username).then((users: AccountEntity[]) => {
			return this.populateContactData(users);
		});
	}

	/**
	 * Find all users whose contact name
	 * @param name The name of the contact.
	 * @return {Promise<any[]>}
	 */
	public findAllByContactNameMatch(name: string): Promise<any[]> {
		this._log.debug("Call to findByContactNameContaining with name %j", name);
		return this.partyService.findByName(name).then((resultQuery: JanuxPeople.PartyAbstract[]) => {
			return this.populateUserData(resultQuery);
		});
	}

	/**
	 * Find all users given an email address.
	 * @param {string} email The email address to look for.
	 * @return {Bluebird<any[]>}
	 */
	public findAllByEmail(email: string): Promise<any[]> {
		this._log.debug("Call to findByEmail with email %j", email);
		return this.partyService.findByEmail(email).then((resultQuery: JanuxPeople.PartyAbstract[]) => {
			return this.populateUserData(resultQuery);
		});
	}

	/**
	 * Find all users given a phone number.
	 * @param {string} phone
	 * @return {Bluebird<any[]>}
	 */
	public findAllByPhone(phone: string): Promise<any[]> {
		this._log.debug("Call to findByPhone with email %j", phone);
		return this.partyService.findByPhone(phone).then((resultQuery: JanuxPeople.PartyAbstract[]) => {
			return this.populateUserData(resultQuery);
		});
	}

	/**
	 * Insert a new user.
	 * @param object The account info to insertMethod.
	 * object must have contact info.
	 * If the contact info has an id. The system assumes
	 * the account is going to be used by an existing party record.
	 * If the contact info doesn't hav an id. The the system
	 * assumes is going to insertMethod a new party record.
	 */
	public insert(object: any): Promise<any> {
		this._log.debug("Call to insertMethod with object %j", object);
		let associatedParty: JanuxPeople.PartyAbstract;
		let result: any;
		const user: AccountEntity = new AccountEntity();
		user.enabled = object.enabled;
		user.userId = object.userId || uuid.v4();
		user.mdate = new Date();
		user.cdate = new Date();
		user.username = object.username;
		user.password = this.passwordService.hashPassword(object.password);
		user.expirePassword = DateUtil.stringToDate(object.expirePassword);
		user.expire = DateUtil.stringToDate(object.expire);
		user.locked = object.locked;
		user.roles = object.roles;

		// Validate user
		const errors = AccountValidator.validateAccountExceptContactId(user);
		if (errors.length > 0) {
			return Promise.reject(errors);
		}

		// Validate if there is another user with the same username.
		return this.accountDao.findOneByUserName(user.username)
			.then((result: AccountEntity) => {
				if (!_.isNil(result)) {
					return Promise.reject([new ValidationErrorImpl(this.ACCOUNT, AccountValidator.ANOTHER_USER, result.username)]);
				} else {
					return this.definePartyInfo(object.contact);
				}
			})
			.then((contacts: JanuxPeople.PartyAbstract) => {
				associatedParty = contacts;
				user.contactId = associatedParty[this.ID_REFERENCE];
				return this.accountDao.insert(user);
			})
			.then((insertedAccount: AccountEntity) => {
				result = insertedAccount;
				result.contact = associatedParty.toJSON();
				result.contact.id = associatedParty["id"];
				result.contact.typeName = associatedParty.typeName;
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Update the account data. Just updateMethod the account info and the associated roles.
	 * One difference with insertMethod is the updateMethod will not update; the contact data.
	 * Instead one must use partyService.updateMethod().
	 * @param object The account to be updated.
	 */
	public update(object: any): Promise<any> {
		this._log.debug("Call to updateMethod with object:%j", object);
		let result: any;
		const user: AccountEntity = new AccountEntity();
		// Find the user. This also helps to retrieve the contactId.
		return this.accountDao
			.findOne(object.id)
			.then(resultQuery => {
				if (resultQuery === null) {
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT, this.ACCOUNT_NOT_IN_DATABASE, object.id)
					]);
				} else {
					user.enabled = object.enabled;
					user.username = object.username;
					if (object.password) {
						user.password = this.passwordService.hashPassword(object.password);
					}
					user.expirePassword = DateUtil.stringToDate(object.expirePassword);
					user.expire = DateUtil.stringToDate(object.expire);
					user.locked = object.locked;
					user.userId = object.userId;
					user.mdate = DateUtil.stringToDate(object.mdate);
					user.cdate = DateUtil.stringToDate(object.cdate);
					user.roles = object.roles;
					user.id = object.id;
					user.contactId = resultQuery.contactId;
					return this.accountDao.update(user);
				}
			})
			.then((updatedAccount: AccountEntity) => {
				result = updatedAccount;
				// Now updateMethod the contact data.
				const contact: any = object.contact;
				let objectToUpdate: any;
				objectToUpdate = PartyServiceImpl.fromJSON(contact);
				objectToUpdate.id = contact.id;
				return this.partyService.update(objectToUpdate);
			})
			.then((updatedParty: any) => {
				result.contact = updatedParty.toJSON();
				result.contact.typeName = updatedParty.typeName;
				result.contact.id = updatedParty.id;
				return Promise.resolve(result);
			});
	}

	/**
	 * Remove sensitive fields, like password.
	 * @param object
	 * @return {any}
	 */
	public removeSensitiveData(object: any): any {
		if (object != null) {
			delete object.password;
		}
		return object;
	}

	private populateUserData(contacts: JanuxPeople.PartyAbstract[]): Promise<any> {
		this._log.debug("Call to populate populateUserData with contacts: %j", contacts);
		const ids = _.map(contacts, (o: any) => o.id);
		let result: any;
		return this.accountDao.findByContactIdsIn(ids).then((users: AccountEntity[]) => {
			result = this.mixData(users, contacts);
			this._log.debug("populateUserData : returning %j", result);
			return Promise.resolve(result);
		});
	}

	private populateContactData(users: AccountEntity[]) {
		this._log.debug("Call to populateContactData with users: %j", users);
		let result: any = users;
		const contactIds = users.map(value => value.contactId);
		return this.partyService.findByIds(contactIds).then((contacts: JanuxPeople.PartyAbstract[]) => {
			result = this.mixData(result, contacts);
			this._log.debug("populateContactData : returning %j", result);
			return Promise.resolve(result);
		});
	}

	private mixData(users: any[], contacts: JanuxPeople.PartyAbstract[]): any[] {
		this._log.debug("Call to mix data with users: %j contacts %j", users, contacts);
		for (const user of users) {
			const contact = _.find(contacts, o => {
				return o["id"] === user.contactId;
			});
			this._log.debug("Founded contact %j", contact);
			if (_.isNil(contact)) {
				this._log.error("NOT CONTACT FOUNDED");
			}
			user.contact = contact.toJSON();
			user.contact.id = contact["id"];
			user.contact.typeName = contact.typeName;
		}
		this._log.debug("Returning from mapData: %j", users);
		return users;
	}

	/**
	 * Validate the contact info before inserting the account.
	 * @param party The party to validate.
	 * @return {any}
	 */
	private definePartyInfo(party: any): Promise<JanuxPeople.PartyAbstract | ValidationErrorImpl[]> {
		this._log.debug("Call to define party  info with party: %j", party);
		let person: JanuxPeople.Person;
		let organization: JanuxPeople.Organization;
		// Check for an id
		if (isBlankString(party.id) === true) {
			// No id. Check port party type before inserting a new party.
			if (_.isString(party.typeName) && party.typeName === PartyValidator.PERSON) {
				person = PartyServiceImpl.fromJSON(party) as JanuxPeople.Person;
				this._log.debug("Inserting the person %j", person);
				return this.partyService.insert(person);
			} else if (_.isString(party.typeName) && party.typeName === PartyValidator.ORGANIZATION) {
				// Itś an organization
				organization = PartyServiceImpl.fromJSON(party) as JanuxPeople.Organization;
				// Insert the organization.
				this._log.debug("Inserting the organization %j", organization);
				return this.partyService.insert(organization);
			} else {
				this._log.warn("No correct party type, returning a reject");
				// No party type, sending an error.
				return Promise.reject([
					new ValidationErrorImpl(this.PARTY_TYPE, PartyValidator.TYPE_NOT_PERSON_OR_ORGANIZATION, "")
				]);
			}
		} else {
			this._log.debug("The account to insertMethod has a contact id");
			let referenceObject: JanuxPeople.PartyAbstract;
			// Look for if there is a party with the same id
			return this.partyService
				.findOne(party.id)
				.then((resultQueryParty: JanuxPeople.PartyAbstract) => {
					if (_.isNull(resultQueryParty)) {
						this._log.warn("The id %j does not exist in the database", party.id);
						return Promise.reject([
							new ValidationErrorImpl(this.PARTY, this.NO_CONTACT_IN_DATABASE, party.id)
						]);
					} else {
						referenceObject = resultQueryParty;
						// Check if there is another account using this contact info.
						return this.accountDao.findOneByContactId(resultQueryParty[this.ID_REFERENCE]);
					}
				})
				.then((resultQueryAccount: AccountEntity) => {
					if (_.isNull(resultQueryAccount)) {
						this._log.debug("Returning %j", resultQueryAccount);
						return Promise.resolve(referenceObject);
					} else {
						this._log.warn("The contact founded has an associated account");
						return Promise.reject([
							new ValidationErrorImpl(this.ACCOUNT, this.ANOTHER_ACCOUNT_USING_CONTACT, "")
						]);
					}
				});
		}
	}
}
