/**
 * Project janux-persist.js
 * Created by ernesto on 4/3/18
 */
import * as Promise from "bluebird";
import {GroupImpl} from "services/group-module/impl/group";
import {PartyGroupItemImpl} from "services/party-group-service/impl/party-group-item-impl";
import {PartyGroupServiceImpl} from "services/party-group-service/impl/party-group-service-impl";
import {ResellerService} from "services/reseller/api/reseller-service";
import {Constants} from "utils/constants";

/**
 * Implementation of the reseller service.
 */
export class ResellerServiceImpl implements ResellerService {

	private partyGroupService: PartyGroupServiceImpl;

	constructor(PartyGroupService: PartyGroupServiceImpl) {
		this.partyGroupService = PartyGroupService;
	}

	/**
	 * Assuming idClient belongs to a reseller. The method return the contacts party group associated to the reseller.
	 * @param {string} idClient The client.
	 * @return {Bluebird<Party>} The contacts of the reseller where the client belongs.
	 * undefined if the client does not belong to a reseller.
	 * undefined if the reseller does not have it own clients group.
	 */
	findResellerContactsByClient(idClient: string): Promise<GroupImpl<PartyGroupItemImpl>> {
		// Get the reseller group where the client belongs.
		return this.partyGroupService.findByTypeAndPartyItem(Constants.GROUP_TYPE_RESELLER_CLIENTS, idClient)
			.then((result: Array<GroupImpl<PartyGroupItemImpl>>) => {
				if (result.length > 0) {
					// Get only the first record.
					// Return the contacts of the reseller.
					const idPartyReseller = result[0].attributes[PartyGroupServiceImpl.ATTRIBUTE_PARTY_ID];
					return this.partyGroupService.findOneOwnedByPartyAndType(idPartyReseller, Constants.GROUP_TYPE_COMPANY_CONTACTS, false);
				} else {
					return Promise.resolve(undefined);
				}
			});
	}
}
