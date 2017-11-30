/**
 * Project glarus-services
 * Created by ernesto on 10/27/17.
 */
import Promise = require("bluebird");
import {PartyAbstract} from "janux-people";
import * as _ from 'lodash';
import {GroupImpl} from "services/group-module/impl/group";
import {GroupPropertiesImpl} from "services/group-module/impl/group-properties";
import {GroupServiceImpl} from "services/group-module/impl/group-service";
import {PartyGroupService} from "services/party-group-service/api/party-group-service";
import {InternalPartyGroupItem} from "services/party-group-service/impl/group-item-internal";
import {PartyGroupItemImpl} from "services/party-group-service/impl/party-group-item-impl";
import {PartyServiceImpl} from "services/party/impl/party-service-impl";
import * as logger from "util/logger-api/logger-api";

export class PartyGroupServiceImpl implements PartyGroupService {

	public static readonly NO_CONTACTS: string = "No contacts";
	public static readonly NO_CONTACT: string = "No contact";
	public static readonly ATTRIBUTE_PARTY_ID: string = 'partyIdOwner';
	private partyService: PartyServiceImpl;
	private groupService: GroupServiceImpl<InternalPartyGroupItem>;
	private log = logger.getLogger("PartyGroupServiceImpl");

	constructor(partyService: PartyServiceImpl, groupService: GroupServiceImpl<InternalPartyGroupItem>) {
		this.partyService = partyService;
		this.groupService = groupService;
	}

	/**
	 * Find all groups ( no content ) given a type.
	 * @param {string} type
	 * @return {Bluebird<GroupPropertiesImpl[]>}
	 */
	findPropertiesByType(type: string): Promise<GroupPropertiesImpl[]> {
		this.log.debub("Call to findPropertiesByType with type: %j  " + type);
		return this.groupService.findPropertiesByType(type);
	}

	/**
	 * Find all group where the party is the owner fo the groups.
	 * @param {string[]} types The group types to look for.
	 * @param {PartyAbstract} partyId The party to look for.
	 * @return {Promise<GroupPropertiesImpl[]>} The groups where the party is associated.
	 */
	findPropertiesOwnedByPartyAndTypes(partyId: string, types: string[]): Promise<GroupPropertiesImpl[]> {
		this.log.debug("Call to findPropertiesOwnedByPartyAndTypes with types %j and party %j", types, partyId);
		return null;
	}

	/**
	 * Find the group (no content) given the type and party.
	 * @param {string} partyId The party to look for
	 * @param {string} type
	 * @return {Promise<GroupPropertiesImpl>}
	 */
	findPropertiesOwnedByPartyAndType(partyId: string, type: string): Promise<GroupPropertiesImpl> {
		return this.groupService.findPropertiesByType(type)
			.then((resultQuery: GroupPropertiesImpl[]) => {
				const filteredGroup = resultQuery.filter((value) => value.attributes[PartyGroupServiceImpl.ATTRIBUTE_PARTY_ID] != null);
				if (filteredGroup.length > 1) {
					this.log.error("There is a party who belongs to more that one group of the same type  and attribute %j", filteredGroup);
				}
				const result: GroupPropertiesImpl = filteredGroup.length === 0 ? null : filteredGroup[0];
				return Promise.reject(result);
			});
	}

	/**
	 * Find one group
	 * @param {string} code the group code.
	 * @return {Promise<GroupImpl<PartyAbstract>>}
	 */
	findOne(code: string): Promise<GroupImpl<PartyGroupItemImpl>> {
		this.log.debug("Call to find one with code: %j", code);
		let resultGroup: GroupImpl<any>;
		let referenceGroup: GroupImpl<InternalPartyGroupItem>;
		return this.groupService.findOne(code)
			.then((result: GroupImpl<InternalPartyGroupItem>) => {
				if (result == null) return Promise.resolve(null);
				referenceGroup = result;
				const ids = _.uniq(result.values.map((value) => value.partyId));
				return this.partyService.findByIds(ids);
			})
			.then((result: PartyAbstract[]) => {
				resultGroup = _.clone(referenceGroup);
				resultGroup.values = referenceGroup.values.map((value) => {
					const item: PartyGroupItemImpl = new PartyGroupItemImpl();
					item.party = _.find(result, (o) => o['id'] === value.partyId);
					item.attributes = value.attributes;
					return item;
				});
				return Promise.resolve(resultGroup);
			});
	}

	/**
	 * Find one group given the type and the owner of the group.
	 * @param {string} partyId partyId The owner of the group.
	 * @param {string} type type The type too look for.
	 * @return {Promise<GroupImpl<PartyAbstract>>} Returns the group or null if there is no group given
	 * the conditions.
	 */
	findOneOwnedByPartyAndType(partyId: string, type: string): Promise<GroupImpl<PartyGroupItemImpl>> {
		this.log.debug("Call to findOneOwnedByPartyAndType by partyId %j, type  %j", partyId, type);
		const filter: {} = {};
		filter[PartyGroupServiceImpl.ATTRIBUTE_PARTY_ID] = partyId;
		return this.groupService.findByTypeAndFilter(type, filter)
			.then((result: Array<GroupImpl<InternalPartyGroupItem>>) => {
				if (result.length > 1) {
					this.log.error("There is more that one party group with the same type and party id \n %j", result);
					// Maybe consider throwing an error.
				} else if (result.length === 0) {
					return Promise.resolve(null);
				} else {
					return this.findOne(result[0].code);
				}
			});
	}

	/**
	 * Return all groups (including content) of all groups of a given types.
	 * @param {string[]} types
	 * @return {Promise<Array<GroupImpl<PartyAbstract>>>}
	 */
	findAllByTypes(types: string[]): Promise<Array<GroupImpl<PartyGroupItemImpl>>> {
		this.log.debug("Call to findAllByTypes with types: %j", types);
		let referenceGroups: Array<GroupImpl<InternalPartyGroupItem>>;
		return this.groupService.findAllByTypes(types)
			.then((result: Array<GroupImpl<InternalPartyGroupItem>>) => {
				referenceGroups = result;
				let ids: string[] = [];
				for (const group of result) {
					ids = ids.concat(group.values.map(value => value.partyId));
				}
				ids = _.uniq(ids);
				return this.partyService.findByIds(ids);
			})
			.then((resultQuery: PartyAbstract[]) => {
				let resultGroup: any[];
				resultGroup = referenceGroups.map(value => {
					const item: any = value;
					item.values = value.values.map(value2 => {
						const item2: PartyGroupItemImpl = new PartyGroupItemImpl();
						item2.party = _.find(resultQuery, (o) => o['id'] === value2.partyId);
						item2.attributes = value.attributes;
						return item2;
					});
					return item;
				});
				return Promise.resolve(resultGroup);
			});
	}

	/**
	 * Inserts a new group.
	 * @param {GroupImpl<PartyAbstract>} group group to insert.
	 * @return {Promise<GroupImpl<PartyAbstract>>} Returns a Promise if the object was inserted correctly. Returns a reject if
	 * there is another group with the same code. Returns a reject if the content of the groups
	 * has duplicated values or any of the  users does not exists in the database.
	 */
	insert(group: GroupImpl<PartyGroupItemImpl>): Promise<GroupImpl<PartyGroupItemImpl>> {
		this.log.debug("Call to insert with group: %j", group);
		const newGroup: GroupImpl<any> = _.clone(group);
		const ids = group.values.map((value) => value['id']);
		newGroup.values = group.values.map(value => {
			const item: PartyGroupItemImpl = new PartyGroupItemImpl();
			item.party = value.party['id'];
			item.attributes = value.attributes;
			return item;
		});
		return this.partyService.findByIds(ids)
			.then((result) => {
				if (result.length !== ids.length) {
					return Promise.reject(PartyGroupServiceImpl.NO_CONTACTS);
				}
				return this.groupService.insert(newGroup);
			}).then((result) => {
				group.code = result.code;
				return Promise.resolve(group);
			});
	}

	/**
	 * Updates a group and it's values.
	 * @param {GroupImpl<any>} group The group to be updated.
	 * @return {Promise<GroupImpl<PartyAbstract>>} Returns a reject if there is no group with the specified type an properties.
	 * Returns a reject if the content of the groups has duplicated values.
	 * Returns a reject if the content of the groups has duplicated values or any of the  users does not exists in the database.
	 */
	update(group: GroupImpl<any>): Promise<GroupImpl<PartyGroupItemImpl>> {
		this.log.debug("Call to update with group: %j", group);
		const groupToUpdate: GroupImpl<any> = _.clone(group);
		const ids = group.values.map((value) => value.id);
		groupToUpdate.values = ids;
		return this.partyService.findByIds(ids)
			.then((resultQuery: any[]) => {
				if (resultQuery.length !== ids.length) {
					return Promise.reject(PartyGroupServiceImpl.NO_CONTACTS);
				}
				return this.groupService.update(groupToUpdate);
			})
			.then((result) => {
				return Promise.resolve(group);
			});
	}

	/**
	 * Delete group.
	 * @param {Group} code
	 * @return {Promise<any>} Returns a reject if there is no group with the specified code.
	 */
	remove(code: string): Promise<any> {
		this.log.debug("Call to remove with code %j", code);
		return this.groupService.remove(code);
	}

	/**
	 * Insert an element to an existing group.
	 * @param {string} code The group code.
	 * @param {t} party The value to insert.
	 * @return {Promise<any>} Return a Promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null or does not exits in the database.
	 */
	addItem(code: string, party: PartyAbstract): Promise<any> {
		this.log.debug("Call to addItem with code: %j, party: %j", code, party);
		return this.partyService.findOne(party['id'])
			.then((resultQuery) => {
				if (resultQuery == null) return Promise.reject(PartyGroupServiceImpl.NO_CONTACT);
				return this.groupService.addItem(code, resultQuery['id']);
			});
	}

	/**
	 * Removes an item of the group.
	 * @param {string} code.
	 * @param party The object to remove.
	 * Return a Promise if the remove was successful.
	 * Returns a reject if there is no group given the code.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItem(code: string, party: PartyAbstract): Promise<any> {
		this.log.debug("Call to removeItem with code:%j , party: %j", code, party);
		return this.groupService.removeItem(code, party['id']);
	}
}
