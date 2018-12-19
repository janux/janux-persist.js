/**
 * Project janux-persistence
 * Created by hielo on 2018-08-17.
 */

import * as Promise from "bluebird";
import { AccountEntity } from "daos/user/account-entity";
import { AccountInvitationDao } from "daos/user/account-invitation-dao";
import { AccountInvitationEntity } from "daos/user/account-invitation-entity";
import { AccountInvitationValidator } from "daos/user/account-invitation-validator";
import * as _ from "lodash";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import { UserService } from "services/user/user-service";
import { DateUtil } from "utils/date/date-util";
import * as logger from "utils/logger-api/logger-api";
import { isBlankString } from "utils/string/blank-string-validator";
// import * as uuid from 'uuid';

/**
 * This class has user action service methods.
 */
export abstract class UserActionService {
	public ACCOUNT_INV = "accountAction";
	public ACCOUNT_INV_NOT_IN_DATABASE = "The account action with this id does not exist in the database";
	protected _log = logger.getLogger("UserActionService");
	protected accountActionDao: AccountInvitationDao;
	protected userService: UserService;

	constructor(accountActionDao: AccountInvitationDao, userService: UserService) {
		this.accountActionDao = accountActionDao;
		this.userService = userService;
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
		// let result: any;
		return this.accountActionDao.findOneByAccountId(id).then((action: AccountInvitationEntity) => {
			// if (_.isNil(action)) return Promise.reject("No action with the account id " + id);
			// result = action;
			// return this.userService.findOneByUserId(action.accountId);
			return action;
		});
		// .then((account: AccountEntity) => {
		// 	result.account = account;
		// 	this._log.debug("Returning %j", result);
		// 	return Promise.resolve(result);
		// });
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
				result.account = account;
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
		// inv.userId = uuid.v4();
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
				} else {
					inv.id = object.id;
					inv.expire = DateUtil.stringToDate(object.expire);
					inv.accountId = object.accountId;
					inv.code = object.code;
					inv.status = object.status;

					return this.accountActionDao.update(inv);
				}
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
	 *
	 * @param {string} contactId
	 * @param {string} selectedEmail
	 * @param rolesToAssign
	 * @return {Bluebird<any>}
	 */
	protected abstract inviteToCreateAccount(
		contactId: string,
		selectedEmail: string,
		rolesToAssign: any,
		templateUrl: string
	): Promise<any>;

	/**
	 *
	 * @param {string} accountId
	 * @param {string} contactId
	 * @param {string} selectedEmail
	 * @return {Bluebird<any>}
	 */
	protected abstract recoverPassword(
		accountId: string,
		contactId: string,
		selectedEmail: string,
		templateUrl: string
	): Promise<any>;
}
