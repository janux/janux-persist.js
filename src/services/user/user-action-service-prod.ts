/**
 * Project janux-persistence
 * Created by hielo on 2018-09-06.
 */
import * as Promise from "bluebird";
import {AccountInvitationDao} from "daos/user/account-invitation-dao";
// import JanuxPeople = require("janux-people");
import * as _ from "lodash";
import * as md5 from "md5";
import * as moment from "moment";
import * as pug from "pug";
import * as randomstring from "randomstring";
import {CommService} from "services/comm/comm-service";
import {PartyServiceImpl} from "services/party/impl/party-service-impl";
import {UserActionService} from "services/user/user-action-service";
import {UserService} from "services/user/user-service";
import * as logger from 'utils/logger-api/logger-api';

export class UserActionServiceProd extends UserActionService {
	public static createInstance(accountInvitationDao: AccountInvitationDao, userService: UserService, partyService: PartyServiceImpl, commService: CommService) {
		return this._instance || (this._instance = new this(accountInvitationDao, userService, partyService, commService));
	}

	private static _instance: UserActionService;
	private accountInvitationDao: AccountInvitationDao;
	private partyService: PartyServiceImpl;
	private commService: CommService;
	private _logInvitations = logger.getLogger('UserInvitations');

	private constructor(accountInvitationDao: AccountInvitationDao, userService: UserService, partyService: PartyServiceImpl, commService: CommService) {
		super(accountInvitationDao, userService);
		this.accountInvitationDao = accountInvitationDao;
		this.userService = userService;
		this.partyService = partyService;
		this.commService = commService;
	}

	protected inviteToCreateAccount(contactId: string, rolesToAssign: any, config: any): Promise<any> {
		this._log.debug("Call to inviteToCreateAccount with id %j and email %j", contactId, config.selectedEmail);

		// Template variables
		const params = {
			name: '',
			email: config.selectedEmail,
			hostname: config.hostname,
			invitationCode: randomstring.generate({
				length: 12,
				charset: 'alphanumeric'
			})
		};

		return this.partyService.findOne(contactId).then((result: any) => {
			params.name = result.name.first + ' ' + result.name.last;

			// Compile template
			const myTemplate = pug.compileFile(config.templateUrl);
			const out = myTemplate(params);

			this._logInvitations.debug('Sending invitation email width params: ' + JSON.stringify(params));

			// Adding email sent event listener
			this.commService.on(this.commService.events.EMAIL_SUCCESS_SENT_EVENT, (resp: any) => {
				this._log.info('Invitation Email successfully sent ' + out);
				this._logInvitations.info('User invitation created ' + out);
			});

			// Adding email error event listener
			this.commService.on(this.commService.events.EMAIL_SENT_ERROR_EVENT, (error: any) => {
				this._log.info('Error sending invitation ' + error);
				// logInvitations.info('User invitation created ' + out);
			});

			// Create account with random values
			const account = {
				userId: contactId,
				enabled: false,
				username: 'xxxx-' + randomstring.generate({
					length: 12,
					charset: 'alphanumeric'
				}),
				password: md5(randomstring.generate({
					length: 12,
					charset: 'alphanumeric'
				})),
				locked: false,
				roles: rolesToAssign,
				contact: {id: contactId}
			};

			const emailParams = {
				to: config.selectedEmail,
				subject: config.msgSubject,
				text: out,
				html: out
			};

			// Send email in an asynchronous way
			this.commService.sendEmail(emailParams);

			return this.userService.findOneByContactId(contactId).then((accountFound: any) => {
				if (_.isNil(accountFound)) {
					return this.userService.insert(account);
				} else {
					return accountFound;
				}
			});
		}).then((result: any) => {
			this._log.info('Creating account ' + JSON.stringify(result));

			const type = 'createAccount';

			// Insert invitation
			const invitation = {
				accountId: result.userId,
				code: params.invitationCode,
				expire: moment().add(5, 'days').toDate(),
				status: 'pending',
				type
			};

			return this.findByAccountIdAndType(result.userId, type).then((invFound: any) => {
				if (_.isNil(invFound)) {
					return this.insert(invitation);
				} else {
					let invReturn: any = null;
					switch (invFound.status) {
						case 'pending':
							// Update expire and code date of the invitation
							invFound.code = invitation.code;
							invFound.expire = invitation.expire;
							this._log.info('Invitation found ' + JSON.stringify(invFound));
							invReturn = this.update(invFound, true);
							break;
						case 'completed':
							invReturn = this.insert(invitation);
							break;
					}
					return invReturn;
				}
			});
		});
	}

	protected recoverPassword(accountId: string, contactId: string, config: any): Promise<any> {
		this._log.debug("Call to recoverPassword with id %j and email %j", contactId, config.selectedEmail);

		// Template variables
		const params = {
			name: '',
			email: config.selectedEmail,
			hostname: config.hostname,
			recoveryCode: randomstring.generate({
				length: 12,
				charset: 'alphanumeric'
			})
		};

		return this.partyService.findOne(contactId).then((result: any) => {
			params.name = result.name.first + ' ' + result.name.last;

			// Compile template
			const myTemplate = pug.compileFile(config.templateUrl);
			const out = myTemplate(params);

			this._log.debug('Sending recovery email width params: ' + JSON.stringify(params));

			// Adding email sent event listener
			this.commService.on(this.commService.events.EMAIL_SUCCESS_SENT_EVENT, (resp: any) => {
				this._log.info('Password recovery email successfully sent ' + out);
				this._logInvitations.info('Password recovery created ' + out);
			});

			// Adding email error event listener
			this.commService.on(this.commService.events.EMAIL_SENT_ERROR_EVENT, (error: any) => {
				this._log.info('Error sending password recovery ' + error);
				// logInvitations.info('User invitation created ' + out);
			});

			const emailParams = {
				to: config.selectedEmail,
				subject: config.msgSubject,
				text: out,
				html: out
			};

			// Send email in an asynchronous way
			this.commService.sendEmail(emailParams);

			const type = 'recoverPassword';

			// Insert recovery
			const recoveryRecord = {
				accountId,
				code: params.recoveryCode,
				expire: moment().add(5, 'days').toDate(),
				status: 'pending',
				type
			};

			return this.findByAccountIdAndType(accountId, type).then((recFound: any) => {
				if (_.isNil(recFound)) {
					return this.insert(recoveryRecord);
				} else {
					let invReturn: any = null;
					switch (recFound.status) {
						case 'pending':
							// Update expire and code date of the recovery
							recFound.code = recoveryRecord.code;
							recFound.expire = recoveryRecord.expire;
							this._log.info('Recovery found ' + JSON.stringify(recFound));
							invReturn = this.update(recFound, true);
							break;
						case 'completed':
							invReturn = this.insert(recoveryRecord);
							break;
					}
					return invReturn;
				}
			});
		});
	}
}
