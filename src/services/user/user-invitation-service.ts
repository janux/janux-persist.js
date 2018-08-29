/**
 * Project janux-persistence
 * Created by hielo on 2018-08-17.
 */

import * as Promise from "bluebird";
import {AccountEntity} from "daos/user/account-entity";
import {AccountInvitationDao} from "daos/user/account-invitation-dao";
import {AccountInvitationEntity} from "daos/user/account-invitation-entity";
import {AccountInvitationValidator} from "daos/user/account-invitation-validator";
import * as _ from 'lodash';
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {UserService} from "services/user/user-service";
import {DateUtil} from "utils/date/date-util";
import * as logger from 'utils/logger-api/logger-api';
import {isBlankString} from "utils/string/blank-string-validator";
// import * as uuid from 'uuid';

/**
 * This class has basic user invitation service methods.
 */
export class UserInvitationService {
	public static createInstance(accountInvitationDao: AccountInvitationDao, userService: UserService) {
		return this._instance || (this._instance = new this(accountInvitationDao, userService));
	}

	private static _instance: UserInvitationService;
	public ACCOUNT_INV = "accountInvitation";
	public ACCOUNT_INV_NOT_IN_DATABASE = "The account invitation with this id does not exist in the database";
	private _log = logger.getLogger("UserInvitationService");
	private accountInvitationDao: AccountInvitationDao;
	private userService: UserService;

	private constructor(accountInvitationDao: AccountInvitationDao, userService: UserService) {
		this.accountInvitationDao = accountInvitationDao;
		this.userService = userService;
	}

	/**
	 * Find one account invitation by its id.
	 * @param {string} id
	 * @return {Promise<any>}
	 */
	public findOneById(id: string): Promise<any> {
		this._log.debug("Call to findOneById with id: %j", id);
		let result: any;
		return this.accountInvitationDao.findOne(id)
			.then((invitation: AccountInvitationEntity) => {
				if (_.isNil(invitation)) {
					this._log.error("No account invitation with the id " + id);
					return Promise.reject("No account invitation with the id " + id);
				}
				result = invitation;
				return this.userService.findOneByUserId(invitation.accountId);
			})
			.then((account: AccountEntity) => {
				result.account = account;
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Find one account invitation by its accountId.
	 * @param id The id
	 * @return {Promise<any>}
	 */
	public findOneByAccountId(id: any): Promise<any> {
		this._log.debug("Call to findOneByAccountId with id: %j", id);
		// let result: any;
		return this.accountInvitationDao.findOneByAccountId(id)
			.then((invitation: AccountInvitationEntity) => {
				// if (_.isNil(invitation)) return Promise.reject("No invitation with the account id " + id);
				// result = invitation;
				// return this.userService.findOneByUserId(invitation.accountId);
				return invitation;
			});
			// .then((account: AccountEntity) => {
			// 	result.account = account;
			// 	this._log.debug("Returning %j", result);
			// 	return Promise.resolve(result);
			// });
	}

	/**
	 * Return all invitations given the ids.
	 * @param {string[]} accountIds
	 * @returns {Bluebird<any[]>}
	 */
	public findByAccountIdsIn(accountIds: string[]): Promise<any[]> {
		this._log.debug("Call to findByContactIdsIn with accountIds: %j", accountIds);
		return this.accountInvitationDao.findByAccountIdsIn(accountIds);
	}

	/**
	 * Find one invitation by its code.
	 * @param code
	 * @return {Promise<any>}
	 */
	public findOneByCode(code: string): Promise<any> {
		this._log.debug("Call to findOneByCode with code: %j", code);
		let result: any;
		return this.accountInvitationDao.findOneByCode(code)
			.then((invitation: AccountInvitationEntity) => {
				if (_.isNil(invitation)) return Promise.reject("No account invitation with the code " + code);
				result = invitation;
				return this.userService.findOneByUserId(invitation.accountId);
			})
			.then((account: AccountEntity) => {
				result.account = account;
				this._log.debug("Returning %j", result);
				return Promise.resolve(result);
			});
	}

	/**
	 * Insert a account invitation.
	 * @param object The invitation to insert.
	 */
	public insert(object: any): Promise<any> {
		this._log.debug("Call to insertMethod with object %j", object);
		const inv: AccountInvitationEntity = new AccountInvitationEntity();
		// inv.userId = uuid.v4();
		inv.expire = DateUtil.stringToDate(object.expire);
		inv.accountId = object.accountId;
		inv.code = object.code;

		// Validate account invitation
		const errors = AccountInvitationValidator.validateAccountInvitation(inv);
		if (errors.length > 0) {
			return Promise.reject(errors);
		}

		return this.accountInvitationDao.insert(object)
			.then((invitation: AccountInvitationEntity) => {

				this._log.debug("Returning %j", invitation);
				return Promise.resolve(invitation);

			});
	}

	/**
	 * Update the account invitation data.
	 * @param object The account invitation to be updated.
	 */
	public update(object: any, skipAccountUpdate: boolean): Promise<any> {
		this._log.debug("Call to updateMethod with object:%j", object);
		let result: any;
		const inv: AccountInvitationEntity = new AccountInvitationEntity();
		// Find the invitation
		return this.accountInvitationDao.findOne(object.id)
			.then((resultQuery) => {
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

					return this.accountInvitationDao.update(inv);
				}
			})
			.then((updatedAccountInvitation: AccountInvitationEntity) => {
				result = updatedAccountInvitation;
				if (!skipAccountUpdate) {
					return this.userService.update(object.account);
				} else {
					return updatedAccountInvitation;
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
	 * Delete an account invitation
	 * @param invitationId The invitation id.
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public deleteInvitationById(invitationId: string): Promise<any> {
		this._log.debug("Call to deleteInvitationById with id: %j", invitationId);
		return this.accountInvitationDao.findOne(invitationId)
			.then((resultQuery: AccountInvitationEntity) => {
				return this.accountInvitationDao.remove(resultQuery);
			});
	}
}
