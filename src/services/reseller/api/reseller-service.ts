/**
 * Project janux-persist.js
 * Created by ernesto on 4/3/18
 */
import * as Promise from "bluebird";
import { Party } from "janux-people";
import { Group } from "services/group-module/api/group";
import { PartyGroupItem } from "services/party-group-service/api/party-group-item";

/**
 * API for the reseller service.
 */
export interface ResellerService {
	/**
	 * Assuming idClient belongs to a reseller. The method return the contacts associated to the reseller.
	 * @param {string} idClient The client.
	 * @return {Bluebird<Party>} The contacts of the reseller where the client belongs.
	 */
	findResellerContactsByClient(idClient: string): Promise<Group<PartyGroupItem>>;

	/**
	 * Return the reseller given a client.
	 * @param idClient The client to look for.
	 */
	findReseller(idClient: string): Promise<Party>;
}
