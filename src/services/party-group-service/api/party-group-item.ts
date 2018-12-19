/**
 * Project janux-persist.js
 * Created by ernesto on 11/30/17.
 */

import { Party } from "janux-people/dist/api/Party";

/**
 * This interface defined the item of a party group.
 */
export interface PartyGroupItem {
	// The party itself.
	party: Party;
	// Extra attributes.
	attributes: { [p: string]: string };
}
