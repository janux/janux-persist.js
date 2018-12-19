/**
 * Project janux-persistence
 * Created by hielo on 2018-09-06.
 */
import * as Promise from "bluebird";
import { AccountInvitationDao } from "daos/user/account-invitation-dao";
// import JanuxPeople = require("janux-people");
import * as pug from "pug";
import * as randomstring from "randomstring";
import { CommService } from "services/comm/comm-service";
import { PartyServiceImpl } from "services/party/impl/party-service-impl";
import { UserActionService } from "services/user/user-action-service";
import { UserService } from "services/user/user-service";
import * as logger from "utils/logger-api/logger-api";

export class UserActionServiceDev extends UserActionService {
	public static createInstance(
		accountInvitationDao: AccountInvitationDao,
		userService: UserService,
		partyService: PartyServiceImpl,
		commService: CommService
	) {
		return (
			this._instance || (this._instance = new this(accountInvitationDao, userService, partyService, commService))
		);
	}

	private static _instance: UserActionService;
	private accountInvitationDao: AccountInvitationDao;
	private partyService: PartyServiceImpl;
	private commService: CommService;
	private _logInvitations = logger.getLogger("UserInvitations");

	private constructor(
		accountInvitationDao: AccountInvitationDao,
		userService: UserService,
		partyService: PartyServiceImpl,
		commService: CommService
	) {
		super(accountInvitationDao, userService);
		this.accountInvitationDao = accountInvitationDao;
		this.userService = userService;
		this.partyService = partyService;
		this.commService = commService;
	}

	protected inviteToCreateAccount(contactId: string, rolesToAssign: any, config: any): Promise<any> {
		this._log.debug("Call to inviteToCreateAccount with id %j and email %j", contactId, config.selectedEmail);

		return this.partyService.findOne(contactId).then((result: any) => {
			const params = {
				name: result.name.first + " " + result.name.last,
				email: config.selectedEmail,
				hostname: config.hostname,
				invitationCode: randomstring.generate({
					length: 12,
					charset: "alphanumeric"
				})
			};

			const myTemplate = pug.compileFile(config.templateUrl);
			const out = myTemplate(params);

			this._logInvitations.debug("Invitation for a staff member to create their account " + out);

			return Promise.resolve(params);
		});
	}

	protected recoverPassword(accountId: string, contactId: string, config: any): Promise<any> {
		this._log.debug("Call to recoverPassword with id %j and email %j", contactId, config.selectedEmail);

		// Template variables
		const params: any = {
			name: "",
			email: config.selectedEmail,
			hostname: config.hostname,
			recoveryCode: randomstring.generate({
				length: 12,
				charset: "alphanumeric"
			})
		};

		return this.partyService.findOne(contactId).then((result: any) => {
			params.name = result.name.first + " " + result.name.last;

			const myTemplate = pug.compileFile(config.templateUrl);
			const out = myTemplate(params);

			this._logInvitations.debug("Recover request " + out);

			return Promise.resolve(params);
		});
	}
}
