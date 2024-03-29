/**
 * Project janux-persist.js
 * Created by ernesto on 11/30/17.
 */
import { PartyAbstract } from "janux-people/dist/impl/Party";
import { PartyGroupItem } from "services/party-group-service/api/party-group-item";
import { PartyServiceImpl } from "services/party/impl/party-service-impl";

export class PartyGroupItemImpl implements PartyGroupItem {
	// The party itself.
	party: PartyAbstract;

	// Extra attributes.
	attributes: { [p: string]: string };

	public toJSON(): any {
		const result: any = {};
		result.attributes = this.attributes;
		result.party = PartyServiceImpl.toJSON(this.party);
		return result;
	}
}
