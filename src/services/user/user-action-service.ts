/**
 * Project janux-persistence
 * Created by hielo on 2018-08-17.
 *
 * Collapsed from the former UserActionService (abstract) +
 * UserActionServiceDev/UserActionServiceProd split (janux-mail plan, Step
 * 1c). That split existed only to pick "actually send mail" vs. "log and
 * skip" - a decision that belongs to whichever app is configuring itself
 * for dev/QA/production, not to this shared package. It's now the caller's
 * `mail.mode` config, one layer up; this class always emits.
 *
 * Template rendering also moved out entirely - recoverPassword/
 * inviteToCreateAccount used to pug.compileFile() a template path the
 * caller passed in and call a commService.sendEmail() this class held a
 * reference to. Neither commService nor pug is a dependency of this class
 * anymore: it emits a domain event (name, plain data) through an injected
 * event bus, and the calling app's own mail-events.js wiring module (see
 * each app's server/src/api/mail-events.js) is what renders a template and
 * dispatches. "Templates stay in the calling app" per the plan's own design.
 */

import * as Promise from "bluebird";
import { AccountEntity } from "daos/user/account-entity";
import { AccountInvitationDao } from "daos/user/account-invitation-dao";
import { AccountInvitationEntity } from "daos/user/account-invitation-entity";
import { AccountInvitationValidator } from "daos/user/account-invitation-validator";
import * as _ from "lodash";
import * as md5 from "md5";
import * as moment from "moment";
import * as randomstring from "randomstring";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import { PartyServiceImpl } from "services/party/impl/party-service-impl";
import { UserService } from "services/user/user-service";
import { MAIL_EVENT_NAMES } from "services/user/user-action-mail-events";
import { DateUtil } from "utils/date/date-util";
import * as logger from "utils/logger-api/logger-api";
import { isBlankString } from "utils/string/blank-string-validator";

/**
 * Anything with Node's EventEmitter#emit shape. Not a hard dependency on
 * the 'events' module - each app passes its own singleton (see
 * server/src/api/events.js in easytitle24-2.x and glarus-ops).
 */
export interface EventBus {
	emit(eventName: string, payload: any): void;
}

/**
 * This class has user action service methods.
 */
export class UserActionService {
	public static createInstance(
		accountActionDao: AccountInvitationDao,
		userService: UserService,
		partyService: PartyServiceImpl,
		eventBus: EventBus
	) {
		return this._instance || (this._instance = new this(accountActionDao, userService, partyService, eventBus));
	}

	public ACCOUNT_INV = "accountAction";
	public ACCOUNT_INV_NOT_IN_DATABASE = "The account action with this id does not exist in the database";
	public ACCOUNT_INV_ALREADY_COMPLETED = "This account action has already been completed";
	public ACCOUNT_INV_EXPIRED = "This account action has expired";
	public ACCOUNT_INV_CODE_MISMATCH = "The code provided does not match this account action";
	public ACCOUNT_INV_ACCOUNT_MISMATCH = "The account provided does not match the account associated with this action";

	private static _instance: UserActionService;
	protected _log = logger.getLogger("UserActionService");
	protected accountActionDao: AccountInvitationDao;
	protected userService: UserService;
	private partyService: PartyServiceImpl;
	private eventBus: EventBus;

	private constructor(
		accountActionDao: AccountInvitationDao,
		userService: UserService,
		partyService: PartyServiceImpl,
		eventBus: EventBus
	) {
		this.accountActionDao = accountActionDao;
		this.userService = userService;
		this.partyService = partyService;
		this.eventBus = eventBus;
	}

	/**
	 * Find one account action by its id.
	 * @param {string} id
	 * @return {Promise<any>}
	 */
	public findOneById(id: string): Promise<any> {
		this._log.debug("Call to findOneById with id: %j", id);
		let result: any;
		return this.accountActionDao
			.findOne(id)
			.then((action: AccountInvitationEntity) => {
				if (_.isNil(action)) {
					this._log.error("No account action with the id " + id);
					return Promise.reject("No account action with the id " + id);
				}
				result = action;
				return this.userService.findOneByUserId(action.accountId);
			})
			.then((account: AccountEntity) => {
				result.account = account;
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Find one account action by its accountId.
	 * @param id The id
	 * @return {Promise<any>}
	 */
	public findOneByAccountId(id: any): Promise<any> {
		this._log.debug("Call to findOneByAccountId with id: %j", id);
		return this.accountActionDao.findOneByAccountId(id).then((action: AccountInvitationEntity) => {
			return action;
		});
	}

	/**
	 * Return all actions given the ids.
	 * @param {string[]} accountIds
	 * @returns {Bluebird<any[]>}
	 */
	public findByAccountIdsIn(accountIds: string[]): Promise<any[]> {
		this._log.debug("Call to findByContactIdsIn with accountIds: %j", accountIds);
		return this.accountActionDao.findByAccountIdsIn(accountIds);
	}

	/**
	 *
	 * @param {string} accountId
	 * @param {string} type
	 * @return {Bluebird<any>}
	 */
	public findByAccountIdAndType(accountId: string, type: string): Promise<any> {
		return this.findByAccountIdsIn([accountId]).then(result => {
			return _.filter(result, { type })[0];
		});
	}

	/**
	 * Find one action by its code.
	 * @param code
	 * @return {Promise<any>}
	 */
	public findOneByCode(code: string): Promise<any> {
		this._log.debug("Call to findOneByCode with code: %j", code);
		let result: any;
		return this.accountActionDao
			.findOneByCode(code)
			.then((action: AccountInvitationEntity) => {
				if (_.isNil(action)) return Promise.reject("No account action with the code " + code);
				result = action;
				return this.userService.findOneByUserId(action.accountId);
			})
			.then((account: AccountEntity) => {
				result.account = this.userService.removeSensitiveData(account);
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Insert a account action.
	 * @param object The action to insert.
	 */
	public insert(object: any): Promise<any> {
		this._log.debug("Call to insertMethod with object %j", object);
		const inv: AccountInvitationEntity = new AccountInvitationEntity();
		inv.expire = DateUtil.stringToDate(object.expire);
		inv.accountId = object.accountId;
		inv.code = object.code;

		// Validate account action
		const errors = AccountInvitationValidator.validateAccountInvitation(inv);
		if (errors.length > 0) {
			return Promise.reject(errors);
		}

		return this.accountActionDao.insert(object).then((action: AccountInvitationEntity) => {
			this._log.debug("Returning %j", action);
			return Promise.resolve(action);
		});
	}

	/**
	 * Update the account action data.
	 *
	 * `skipAccountUpdate === true` is a trusted, service-internal call (the
	 * `recoverPassword`/`inviteToCreateAccount` flows re-issuing their own
	 * code/expire on an existing pending record) and is passed straight
	 * through unvalidated, same as before.
	 *
	 * `skipAccountUpdate` falsy is the untrusted path: a caller (typically an
	 * unauthenticated RPC route) claiming to *complete* an invitation/recovery
	 * action. That path must not take `code`/`status`/`expire`/`accountId`
	 * from the caller's object at all — it validates the caller-supplied code
	 * against the stored record, requires the record still be pending and
	 * unexpired, and requires the account being written match the account the
	 * invitation was actually issued for. Only then is it moved to
	 * "completed" and the account update performed.
	 *
	 * @param object The account action to be updated.
	 */
	public update(object: any, skipAccountUpdate: boolean): Promise<any> {
		this._log.debug("Call to updateMethod with object:%j", object);
		let result: any;
		const inv: AccountInvitationEntity = new AccountInvitationEntity();
		// Find the action
		return this.accountActionDao
			.findOne(object.id)
			.then(resultQuery => {
				if (resultQuery === null) {
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT_INV, this.ACCOUNT_INV_NOT_IN_DATABASE, object.id)
					]);
				}

				if (skipAccountUpdate) {
					inv.id = object.id;
					inv.expire = DateUtil.stringToDate(object.expire);
					inv.accountId = object.accountId;
					inv.code = object.code;
					inv.status = object.status;

					return this.accountActionDao.update(inv);
				}

				// Untrusted completion: validate against the stored record,
				// never trust the caller's code/status/expire/accountId.
				if (resultQuery.status !== "pending") {
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT_INV, this.ACCOUNT_INV_ALREADY_COMPLETED, object.id)
					]);
				}

				const storedExpire = DateUtil.stringToDate(resultQuery.expire);
				if (!_.isNil(storedExpire) && storedExpire < new Date()) {
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT_INV, this.ACCOUNT_INV_EXPIRED, object.id)
					]);
				}

				if (isBlankString(object.code) || object.code !== resultQuery.code) {
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT_INV, this.ACCOUNT_INV_CODE_MISMATCH, object.id)
					]);
				}

				if (_.isNil(object.account) || object.account.userId !== resultQuery.accountId) {
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT_INV, this.ACCOUNT_INV_ACCOUNT_MISMATCH, object.id)
					]);
				}

				inv.id = resultQuery.id;
				inv.expire = resultQuery.expire;
				inv.accountId = resultQuery.accountId;
				inv.code = resultQuery.code;
				inv.status = "completed";

				return this.accountActionDao.update(inv);
			})
			.then((updatedAccountAction: AccountInvitationEntity) => {
				result = updatedAccountAction;
				if (!skipAccountUpdate) {
					return this.userService.update(object.account);
				} else {
					return updatedAccountAction;
				}
			})
			.then((updatedAccount: any) => {
				if (!skipAccountUpdate) {
					result.account = updatedAccount;
				}
				return Promise.resolve(result);
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
			return this.update(object, false);
		}
	}

	/**
	 * Delete an account action
	 * @param actionId The action id.
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteActionById(actionId: string): Promise<any> {
		this._log.debug("Call to deleteActionById with id: %j", actionId);
		return this.accountActionDao.findOne(actionId).then((resultQuery: AccountInvitationEntity) => {
			return this.accountActionDao.remove(resultQuery);
		});
	}

	/**
	 * Invite a contact to create an account, and email them a code to do so.
	 *
	 * `config` carries `{selectedEmail, hostname}` - the caller's own
	 * subject/template choice no longer travels through here (see the
	 * class-level doc comment); the emitted event carries only the plain
	 * data a template needs.
	 *
	 * @param {string} contactId
	 * @param rolesToAssign
	 * @param config
	 * @return {Bluebird<any>}
	 */
	public inviteToCreateAccount(contactId: string, rolesToAssign: any, config: any): Promise<any> {
		this._log.debug("Call to inviteToCreateAccount with id %j and email %j", contactId, config.selectedEmail);

		const invitationCode = randomstring.generate({
			length: 12,
			charset: "alphanumeric"
		});

		return this.partyService
			.findOne(contactId)
			.then((result: any) => {
				const name = result.name.first + " " + result.name.last;

				// Create account with random values
				const account = {
					userId: contactId,
					enabled: false,
					username:
						"xxxx-" +
						randomstring.generate({
							length: 12,
							charset: "alphanumeric"
						}),
					password: md5(
						randomstring.generate({
							length: 12,
							charset: "alphanumeric"
						})
					),
					locked: false,
					roles: rolesToAssign,
					contact: { id: contactId }
				};

				return this.userService.findOneByContactId(contactId).then((accountFound: any) => {
					const foundOrCreated = _.isNil(accountFound) ? this.userService.insert(account) : Promise.resolve(accountFound);
					return foundOrCreated.then((resultAccount: any) => ({ name, resultAccount }));
				});
			})
			.then(({ name, resultAccount }: { name: string; resultAccount: any }) => {
				this._log.info("Creating account " + JSON.stringify(resultAccount));

				const type = "createAccount";

				const invitation = {
					accountId: resultAccount.userId,
					code: invitationCode,
					expire: moment()
						.add(5, "days")
						.toDate(),
					status: "pending",
					type
				};

				return this.findByAccountIdAndType(resultAccount.userId, type).then((invFound: any) => {
					let saved: Promise<any>;
					if (_.isNil(invFound)) {
						saved = this.insert(invitation);
					} else {
						switch (invFound.status) {
							case "pending":
								invFound.code = invitation.code;
								invFound.expire = invitation.expire;
								this._log.info("Invitation found " + JSON.stringify(invFound));
								saved = this.update(invFound, true);
								break;
							case "completed":
								saved = this.insert(invitation);
								break;
							default:
								saved = Promise.resolve(invFound);
						}
					}
					return saved.then((savedInvitation: any) => {
						this.eventBus.emit(MAIL_EVENT_NAMES.USER_INVITED, {
							to: config.selectedEmail,
							data: {
								name,
								email: config.selectedEmail,
								hostname: config.hostname,
								invitationCode
							}
						});
						return savedInvitation;
					});
				});
			});
	}

	/**
	 * Send a password-recovery code to one of the account's own registered
	 * email addresses.
	 *
	 * `selectedEmail` identifies which of the account's several addresses to
	 * use, but must actually belong to the contact - checked against
	 * `contact.emailAddresses()` rather than trusted outright (JAM-19: this
	 * used to mail the code wherever a caller asked).
	 *
	 * @param {string} accountId
	 * @param {string} contactId
	 * @param config `{selectedEmail, hostname}`
	 * @return {Bluebird<any>}
	 */
	public recoverPassword(accountId: string, contactId: string, config: any): Promise<any> {
		this._log.debug("Call to recoverPassword with id %j and email %j", contactId, config.selectedEmail);

		return this.partyService.findOne(contactId).then((result: any) => {
			const registeredEmails: string[] = result
				.emailAddresses(false)
				.map((emailAddress: any) => emailAddress.address);
			if (!_.includes(registeredEmails, config.selectedEmail)) {
				this._log.warn(
					"Rejected recoverPassword: %j is not a registered email address for contact %j",
					config.selectedEmail,
					contactId
				);
				return Promise.reject(
					"The selected email address does not belong to the account on file"
				);
			}

			const name = result.name.first + " " + result.name.last;
			const recoveryCode = randomstring.generate({
				length: 12,
				charset: "alphanumeric"
			});

			const type = "recoverPassword";
			const recoveryRecord = {
				accountId,
				code: recoveryCode,
				expire: moment()
					.add(5, "days")
					.toDate(),
				status: "pending",
				type
			};

			return this.findByAccountIdAndType(accountId, type).then((recFound: any) => {
				let saved: Promise<any>;
				if (_.isNil(recFound)) {
					saved = this.insert(recoveryRecord);
				} else {
					switch (recFound.status) {
						case "pending":
							recFound.code = recoveryRecord.code;
							recFound.expire = recoveryRecord.expire;
							this._log.info("Recovery found " + JSON.stringify(recFound));
							saved = this.update(recFound, true);
							break;
						case "completed":
							saved = this.insert(recoveryRecord);
							break;
						default:
							saved = Promise.resolve(recFound);
					}
				}
				return saved.then((savedRecovery: any) => {
					this.eventBus.emit(MAIL_EVENT_NAMES.PASSWORD_RECOVERY_REQUESTED, {
						to: config.selectedEmail,
						data: {
							name,
							email: config.selectedEmail,
							hostname: config.hostname,
							recoveryCode
						}
					});
					return savedRecovery;
				});
			});
		});
	}
}
