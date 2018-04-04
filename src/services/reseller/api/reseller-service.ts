/**
 * Project janux-persist.js
 * Created by ernesto on 4/3/18
 */
import * as Promise from "bluebird";
import {Party} from "janux-people";

/**
 * API for the reseller service.
 */
export interface ResellerService {

	/**
	 * Assuming idClient belongs to a reseller. The method return the contacts associated to the reseller.
	 * @param {string} idClient The client.
	 * @return {Bluebird<Party>} The contacts of the reseller where the client belongs.
	 */
	findResellerContactsByClient(idClient: string): Promise<Party>;
}
