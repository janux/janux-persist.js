/**
 * Project janux-persist.js
 * Created by ernesto on 11/16/17.
 */
import Promise = require("bluebird");
import { PartyAbstract } from "janux-people";
import { GroupImpl } from "services/group-module/impl/group";
import { GroupPropertiesImpl } from "services/group-module/impl/group-properties";
import { PartyGroupServiceImpl } from "services/party-group-service/impl/party-group-service-impl";
import { PartyServiceImpl } from "services/party/impl/party-service-impl";
import { StaffGroupService } from "services/staff-group-service/api/staff-group-service";
import * as logger from "utils/logger-api/logger-api";

export class StaffGroupServiceImpl implements StaffGroupService {
	public static readonly NO_ORGANIZATION: string = "No organization founded";
	public static readonly STAFF_GROUP_TYPE: "staff";
	private _log = logger.getLogger("StaffGroupServiceImpl");
	private partyService: PartyServiceImpl;
	private partyGroupService: PartyGroupServiceImpl;

	constructor(partyService: PartyServiceImpl, groupService: PartyGroupServiceImpl) {
		this.partyService = partyService;
		this.partyGroupService = groupService;
	}

	registerOrganization(organization: PartyAbstract): Promise<GroupImpl<PartyAbstract>> {
		this._log.debug("registering organization %j", organization["id"]);
		// Find organization
		return this.partyService.findOne(organization["id"]).then((result: PartyAbstract) => {
			if (result == null) {
				this._log.warn("failed to register organization %j: not found", organization["id"]);
				return Promise.reject(StaffGroupServiceImpl.NO_ORGANIZATION);
			}
			// Check if there is an existing group associated with the organization.
		});
	}

	addItem(organization: PartyAbstract, person: PartyAbstract): Promise<any> {
		return null;
	}

	removeItem(organization: PartyAbstract, person: PartyAbstract): Promise<any> {
		return null;
	}

	findOne(id: string): GroupImpl<PartyAbstract> {
		return null;
	}

	findProperties(): Promise<GroupPropertiesImpl[]> {
		return null;
	}
}
