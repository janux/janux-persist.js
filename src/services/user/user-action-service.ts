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
import * as moment from "moment";
import * as randomstring from "randomstring";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import { PartyServiceImpl } from "services/party/impl/party-service-impl";
import { UserService } from "services/user/user-service";
import { DEFAULT_PASSWORD_POLICY, PasswordPolicy } from "services/password/password-policy";
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
		this._log.debug("finding account action by id %j", id);
		let result: any;
		return this.accountActionDao
			.findOne(id)
			.then((action: AccountInvitationEntity) => {
				if (_.isNil(action)) {
					this._log.warn("failed to find account action by id %j: not found", id);
					return Promise.reject("No account action with the id " + id);
				}
				result = action;
				return this.userService.findOneByUserId(action.accountId);
			})
			.then((account: AccountEntity) => {
				result.account = account;
				this._log.debug("found account action by id %j -> %j", id, result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Find one account action by its accountId.
	 * @param id The id
	 * @return {Promise<any>}
	 */
	public findOneByAccountId(id: any): Promise<any> {
		this._log.debug("finding account action by accountId %j", id);
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
		this._log.debug("finding account actions by accountIds %j", accountIds);
		return this.accountActionDao.findByAccountIdsIn(accountIds);
	}

	/**
	 *
	 * @param {string} accountId
	 * @param {string} type
	 * @return {Bluebird<any>}
	 */
	public findByAccountIdAndType(accountId: string, type: string): Promise<any> {
		this._log.trace("finding account action by accountId %j and type %j", accountId, type);
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
		// Never log the code itself -- it's a bearer credential, same as a password, until it's spent.
		this._log.debug("finding account action by code");
		let result: any;
		return this.accountActionDao
			.findOneByCode(code)
			.then((action: AccountInvitationEntity) => {
				if (_.isNil(action)) {
					// Never log the code itself -- it's a bearer credential,
					// same as a password, until it's spent.
					this._log.warn("findOneByCode: no account action found for the supplied code");
					return Promise.reject("No account action with the code " + code);
				}
				result = action;
				return this.userService.findOneByUserId(action.accountId);
			})
			.then((account: AccountEntity) => {
				result.account = this.userService.removeSensitiveData(account);
				this._log.debug("Returning %j", result);
				// Unlike the DAO-layer logging AccountInvitationEntity.toJSON() guards
				// against, this method's whole contract is to hand the code back to a
				// legitimate caller -- the client round-trips it into update() to
				// complete a password recovery or invitation acceptance. Returning the
				// entity instance as-is would run it through that same toJSON() (every
				// JSON.stringify(), including the one serializing the HTTP response)
				// and silently strip the code the caller actually needs. A plain clone
				// has no toJSON() to do that, so the code survives.
				return Promise.resolve(Object.assign({}, result));
			});
	}

	/**
	 * Insert a account action.
	 * @param object The action to insert.
	 */
	public insert(object: any): Promise<any> {
		// object.code is the invitation/recovery code - never log the raw
		// object. inv, once fully populated below, is a real
		// AccountInvitationEntity, protected by its own toJSON().
		const inv: AccountInvitationEntity = new AccountInvitationEntity();
		inv.expire = DateUtil.stringToDate(object.expire);
		inv.accountId = object.accountId;
		inv.code = object.code;
		inv.status = object.status;
		inv.type = object.type;
		this._log.debug("inserting account action %j", inv);

		// Validate account action
		const errors = AccountInvitationValidator.validateAccountInvitation(inv);
		if (errors.length > 0) {
			this._log.warn("failed to insert account action %j: validation errors %j", inv, errors);
			return Promise.reject(errors);
		}

		// Insert inv (a real entity), not the raw object - every log
		// statement downstream, starting with AbstractDataAccessObject's
		// own, relies on this to redact the code.
		return this.accountActionDao.insert(inv).then((action: AccountInvitationEntity) => {
			this._log.debug("inserted account action %j", action);
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
	 * @param skipAccountUpdate
	 * @param passwordPolicy Policy the completing account's new password must satisfy
	 * (JAM-25) - defaults to DEFAULT_PASSWORD_POLICY, ignored when skipAccountUpdate is true.
	 */
	public update(object: any, skipAccountUpdate: boolean, passwordPolicy: PasswordPolicy | null = DEFAULT_PASSWORD_POLICY): Promise<any> {
		// object.code is the invitation/recovery code and object.account.password is the
		// completing account's new plaintext password when present - never log either.
		const safeObjectToLog: any = _.omit(object, "code");
		if (safeObjectToLog.account) {
			safeObjectToLog.account = _.omit(safeObjectToLog.account, "password");
		}
		this._log.debug("updating account action %j", safeObjectToLog);
		let result: any;
		// accountActionDao.update() only $sets the fields it's given and
		// echoes the input object back, not the stored document -- `inv`
		// never carries `type`, so it has to be captured here to log it.
		let actionType: string;
		const inv: AccountInvitationEntity = new AccountInvitationEntity();
		// Find the action
		return this.accountActionDao
			.findOne(object.id)
			.then(resultQuery => {
				if (resultQuery === null) {
					this._log.warn("update: no account action with id %j", object.id);
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
				// never trust the caller's code/status/expire/accountId. Each
				// rejection here is expected, attacker/user-caused input
				// (a stale tab, a reused link, a guessed code) rather than a
				// system fault -- WARN, not ERROR, and never log the code
				// itself, only the action id.
				if (resultQuery.status !== "pending") {
					this._log.warn("update: account action %j already completed", object.id);
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT_INV, this.ACCOUNT_INV_ALREADY_COMPLETED, object.id)
					]);
				}

				const storedExpire = DateUtil.stringToDate(resultQuery.expire);
				if (!_.isNil(storedExpire) && storedExpire < new Date()) {
					this._log.warn("update: account action %j has expired", object.id);
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT_INV, this.ACCOUNT_INV_EXPIRED, object.id)
					]);
				}

				if (isBlankString(object.code) || object.code !== resultQuery.code) {
					this._log.warn("update: code mismatch for account action %j", object.id);
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT_INV, this.ACCOUNT_INV_CODE_MISMATCH, object.id)
					]);
				}

				if (_.isNil(object.account) || object.account.userId !== resultQuery.accountId) {
					this._log.warn("update: account mismatch for account action %j", object.id);
					return Promise.reject([
						new ValidationErrorImpl(this.ACCOUNT_INV, this.ACCOUNT_INV_ACCOUNT_MISMATCH, object.id)
					]);
				}

				inv.id = resultQuery.id;
				inv.expire = resultQuery.expire;
				inv.accountId = resultQuery.accountId;
				inv.code = resultQuery.code;
				inv.status = "completed";
				actionType = resultQuery.type;

				return this.accountActionDao.update(inv);
			})
			.then((updatedAccountAction: AccountInvitationEntity) => {
				result = updatedAccountAction;
				if (!skipAccountUpdate) {
					return this.userService.update(object.account, passwordPolicy);
				} else {
					return updatedAccountAction;
				}
			})
			.then((updatedAccount: any) => {
				if (!skipAccountUpdate) {
					result.account = updatedAccount;
					this._log.info('update: completed "%s" action for %j', actionType, updatedAccount && updatedAccount.username);
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
		this._log.debug("saveOrUpdate choosing insert or update for account action %j", _.omit(object, "code"));
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
		this._log.debug("deleting account action by id %j", actionId);
		return this.accountActionDao.findOne(actionId).then((resultQuery: AccountInvitationEntity) => {
			if (_.isNil(resultQuery)) {
				this._log.warn("failed to delete account action by id %j: not found", actionId);
				return Promise.reject("No account action with the id " + actionId);
			}
			return this.accountActionDao.remove(resultQuery).then((result: any) => {
				this._log.info("deleted account action -> id %j", actionId);
				return result;
			});
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
		this._log.debug("inviting contact %j to create an account, email %j", contactId, config.selectedEmail);

		const invitationCode = randomstring.generate({
			length: 12,
			charset: "alphanumeric"
		});

		return this.partyService
			.findOne(contactId)
			.then((result: any) => {
				const name = result.name.first + " " + result.name.last;

				// Create account with random values. The password is an
				// unusable placeholder, not a real credential: it exists
				// only because AccountDaoMongooseImpl.validateBeforeInsert()
				// requires a non-blank one, and the invitee can't sign in
				// with it anyway (enabled: false, plus insert()'s own hash
				// makes it unguessable) until update() replaces it with a
				// real one on completing registration.
				//
				// This used to be pre-hashed with md5 before handing it to
				// insert(), which now also hashes whatever plaintext it is
				// given (JAM-41) - that combination double-hashed it, and
				// insert()'s new password-policy check (JAM-25) rejected
				// the md5 digest outright besides (letters+digits, no
				// symbol, never satisfies the composition rule). Pass the
				// plaintext directly and opt out of the policy check with
				// passwordPolicy: null below - this placeholder was never a
				// user's chosen password, so it isn't the case that policy
				// is meant to police.
				const account = {
					userId: contactId,
					enabled: false,
					username:
						"xxxx-" +
						randomstring.generate({
							length: 12,
							charset: "alphanumeric"
						}),
					password: randomstring.generate({
						length: 12,
						charset: "alphanumeric"
					}),
					locked: false,
					roles: rolesToAssign,
					contact: { id: contactId }
				};

				return this.userService.findOneByContactId(contactId).then((accountFound: any) => {
					const foundOrCreated = _.isNil(accountFound) ? this.userService.insert(account, null) : Promise.resolve(accountFound);
					return foundOrCreated.then((resultAccount: any) => ({ name, resultAccount }));
				});
			})
			.then(({ name, resultAccount }: { name: string; resultAccount: any }) => {
				// Safe: resultAccount is always a real AccountEntity here (both branches above
				// resolve through the DAO's convertAfterDbOperation), and AccountEntity.toJSON()
				// omits password - unlike invFound/recFound below, this needs no extra redaction.
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
								// Never log the code - see update()'s handling of the same field.
								this._log.info("Invitation found " + JSON.stringify(_.omit(invFound, "code")));
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
						this._log.info("invited contact %j to create an account -> accountId %j", contactId, resultAccount.userId);
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
		this._log.debug("recovering password for contact %j, email %j", contactId, config.selectedEmail);

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
							// Never log the code - see update()'s handling of the same field.
							this._log.info("Recovery found " + JSON.stringify(_.omit(recFound, "code")));
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
					this._log.info("recovering password for contact %j -> accountId %j", contactId, accountId);
					return savedRecovery;
				});
			});
		});
	}
}
