/**
 * Project
 * Created by ernesto on 8/16/17.
 */
import Promise = require("bluebird");
import * as log4js from "log4js";
import {GroupAttributeValueEntity} from "../../../daos/group-attribute-value/group-attribute-value";
import {GroupAttributeValueDao} from "../../../daos/group-attribute-value/group-attribute-value-dao";
import {GroupContentDao} from "../../../daos/group-content/group-content-dao";
import {GroupContentEntity} from "../../../daos/group-content/group-content-entity";
import {GroupDao} from "../../../daos/group/group-dao";
import {GroupEntity} from "../../../daos/group/group-entity";
import {ValidationErrorImpl} from "../../../persistence/implementations/dao/validation-error";
import {GroupService} from "../api/group-service";
import {GroupImpl} from "./group";
import {GroupPropertiesImpl} from "./group-properties";
import {GroupServiceValidator} from "./group-service-validator";

/**
 * Implementation of the GroupImpl service.
 * As a comment. This service needs to handle attributes that are not recommended to
 * expose outside the project (the attribute code). In this case this service should not exposed to the internet.
 * Instead encapsulate the methods with another service.
 */
export class GroupServiceImpl<t> implements GroupService<t> {

	private groupDao: GroupDao;
	private groupContentDao: GroupContentDao;
	private groupAttributeValueDao: GroupAttributeValueDao;
	private log = log4js.getLogger("GroupServiceImpl");

	constructor(groupDao: GroupDao, groupContentDao: GroupContentDao, groupAttributeValueDao: GroupAttributeValueDao) {
		this.groupDao = groupDao;
		this.groupContentDao = groupContentDao;
		this.groupAttributeValueDao = groupAttributeValueDao;
		this.log.debug("Constructor");
	}

	/**
	 * Return all group properties (no content) that shares the same type.
	 * @param {string} type
	 * @return {Bluebird<GroupProperties[]>} Return a list of group references.
	 */
	findPropertiesByType(type: string): Promise<GroupPropertiesImpl[]> {
		this.log.debug("Call to findPropertiesByType with type %j", type);
		let groups: GroupEntity[];
		return this.groupDao.findByType(type)
			.then((resultQuery: GroupEntity[]) => {
				groups = resultQuery;
				const ids: string[] = groups.map((value) => value.id);
				return this.groupAttributeValueDao.findByIdsGroupIn(ids);
			})
			.then((resultQuery: GroupAttributeValueEntity[]) => {
				let result: GroupPropertiesImpl[];
				result = groups.map((value) => {
					const element: GroupPropertiesImpl = new GroupPropertiesImpl();
					element.name = value.name;
					element.description = value.description;
					element.code = value.code;
					element.type = value.type;
					element.attributes = this.attributesToDictionary(resultQuery.filter((value2) => value2.idGroup === value.id));
					return element;
				});
				return Promise.resolve(result);
			});
	}

	/**
	 * Return all groups properties (no content) where the object is defined.
	 * @param {string} type The type of groups to filter.
	 * @param {t} object The object to look for.
	 * @return {Bluebird<GroupPropertiesImpl[]>} Returns a promise indicating the groups where the object
	 * is defined.
	 */
	findPropertiesByTypeAndItem(type: string, object: t): Promise<GroupPropertiesImpl[]> {
		this.log.debug("Call to findAllPropertiesByTypeAndItem with type: %j, object: %j", type, object);
		let groups: GroupEntity[];
		let groupsMatchCriteria: GroupEntity[];
		return this.groupDao.findByType(type)
			.then((resultQuery: GroupEntity[]) => {
				const ids = resultQuery.map((value) => value.id);
				groups = resultQuery;
				return this.groupContentDao.findByIdGroupsInAndValue(ids, object);
			})
			.then((resultQuery: GroupContentEntity[]) => {
				const idsMatchFilter = resultQuery.map((value) => value.idGroup);
				groupsMatchCriteria = groups.filter((value) => {
					return idsMatchFilter.indexOf(value.id) >= 0;
				});
				return this.groupAttributeValueDao.findByIdsGroupIn(idsMatchFilter);
			})
			.then((attributesValues: GroupAttributeValueEntity[]) => {
				let result: GroupPropertiesImpl[];
				result = groupsMatchCriteria.map((value) => {
					const element: GroupPropertiesImpl = new GroupPropertiesImpl();
					const subAttributesValues: GroupAttributeValueEntity[] = attributesValues.filter((value) => value.idGroup === value.id);
					element.name = value.name;
					element.code = value.code;
					element.description = value.description;
					element.type = value.type;
					element.attributes = this.attributesToDictionary(subAttributesValues);
					return element;
				});
				return Promise.resolve(result);
			});
	}

	/**
	 * Find all groups that belongs to the same type.
	 * @param {string} type The type to look for.
	 * @return {Bluebird<Array<Group<t>>>} Return a list of groups. Returns an empty array if there is no
	 * group with this type.
	 */
	findAll(type: string): Promise<Array<GroupImpl<t>>> {
		this.log.debug("Call to findAll");
		let groups: GroupEntity[];
		let ids: string[];
		let attributesValues: GroupAttributeValueEntity[];
		let groupContent: GroupContentEntity[];
		return this.groupDao.findByType(type)
			.then((resultQuery: GroupEntity[]) => {
				groups = resultQuery;
				ids = groups.map((value) => value.id);
				return this.groupAttributeValueDao.findByIdsGroupIn(ids);
			})
			.then((resultQuery: GroupAttributeValueEntity[]) => {
				attributesValues = resultQuery;
				return this.groupContentDao.findByIdGroupsIn(ids);
			})
			.then((resultQuery: GroupContentEntity[]) => {
				groupContent = resultQuery;
				return Promise.resolve(this.mixData(groups, attributesValues, groupContent));
			});
	}

	/**
	 * Find one group given the code.
	 * @param {string} code
	 * @return {Bluebird<Group<t>>} Return the group or null if there is no group given the code.
	 */
	findOne(code: string): Promise<GroupImpl<t>> {
		this.log.debug("Call to findOne with code %j", code);
		let groupReference: GroupEntity;
		let attributes: {};
		return this.groupDao.findOneByCode(code)
			.then((group: GroupEntity) => {
				if (group == null) {
					return Promise.resolve(null);
				} else {
					groupReference = group;
					return this.groupAttributeValueDao.findByIdGroup(groupReference.id)
						.then((resultQuery: GroupAttributeValueEntity[]) => {
							attributes = this.attributesToDictionary(resultQuery);
							return this.groupContentDao.findByIdGroup(group.id);
						})
						.then((resultQuery: GroupContentEntity[]) => {
							const result: GroupImpl<t> = new GroupImpl<t>();
							result.type = groupReference.type;
							result.name = groupReference.name;
							result.description = groupReference.description;
							result.code = groupReference.code;
							result.attributes = attributes;
							result.values = resultQuery.map((value) => value.value);
							return Promise.resolve(result);
						});
				}
			});
	}

	/**
	 * Find several groups and it's content.
	 * @param {string} type. The type to look for.
	 * @param {} filter A key-value map that will help to filter the groups that shares the same type. This is as a AND filter.
	 * If there is an empty map then the method will return all groups of the same type.
	 * @return {Bluebird<GroupImpl[]>} Return a list of groups. Returns an empty array if there is no group that qualifies
	 * with the type and filter.
	 */
	findByTypeAndFilter(type: string, filter: { [p: string]: string }): Promise<Array<GroupImpl<t>>> {
		this.log.debug("Call to findByTypeAndFilter with type: %j , filter: %j", type, filter);
		let groups: GroupEntity[];
		let groupsMathCriteria: GroupEntity[];
		let ids: string[];
		const lengtKeys = Object.keys(filter).length;
		let attributesValues: GroupAttributeValueEntity[];
		let groupContent: GroupContentEntity[];
		const amountKeys = Object.keys(filter).length;
		// Get all groups with the same type.
		return this.groupDao.findByType(type)
			.then((resultQuery: GroupEntity[]) => {
				groups = resultQuery;
				ids = groups.map((value) => value.id);
				// Get all key-value attributes.
				if (lengtKeys === 0) {
					groupsMathCriteria = resultQuery;
					return this.groupAttributeValueDao.findByIdsGroupIn(ids);
				} else {
					return this.groupAttributeValueDao.findByIdGroupsAndKeyValuesMatch(ids, filter)
						.then((resultQuery: GroupAttributeValueEntity[]) => {
							groupsMathCriteria = groups.filter((value) => {
								const keyValuePair = resultQuery.filter((keyValuePair) => keyValuePair.idGroup === value.id);
								return keyValuePair.length === amountKeys;
							});

							ids = groupsMathCriteria.map((value) => value.id);
							return this.groupAttributeValueDao.findByIdsGroupIn(ids);
						});
				}
			})
			.then((resultQuery: GroupAttributeValueEntity[]) => {
				attributesValues = resultQuery;
				return this.groupContentDao.findByIdGroupsIn(ids);
			})
			.then((resultQuery: GroupContentEntity[]) => {
				groupContent = resultQuery;
				return Promise.resolve(this.mixData(groupsMathCriteria, attributesValues, groupContent));
			});
	}

	/**
	 * Inserts a new group.
	 * @param {GroupImpl} group to insert.
	 * @return {Promise<GroupImpl>} Returns a promise if the object was inserted correctly. Return a reject if
	 * there is another group with the same code. Returns a reject if the content of the groups
	 * has duplicated values.
	 */
	insert(group: GroupImpl<t>): Promise<GroupImpl<t>> {
		this.log.debug("Call to insert with group: %j", group);
		const errors = GroupServiceValidator.validateGroup(group);
		if (errors.length > 0) {
			return Promise.reject(errors);
		}
		return this.groupDao.findOneByCode(group.code)
			.then((resultQuery: GroupEntity) => {
				if (resultQuery != null) {
					this.log.warn("There is a group with the same type and attributes: %j", group);
					return Promise.reject(GroupServiceValidator.DUPLICATED_GROUP);
				} else {
					return this.insertToDatabase(group);
				}
			});
	}

	/**
	 * Updates a group and it's content.
	 * @param {Group} group The group to be updated.
	 * @return {Promise<Group>} Returns a reject if there is no group with the specified code.
	 * Returns a reject if the content of the groups has duplicated values.
	 */
	update(group: GroupImpl<t>): Promise<GroupImpl<t>> {
		this.log.debug("Call to update with group %j", group);
		let updatedGroup: GroupEntity;
		const errors = GroupServiceValidator.validateGroup(group);
		if (errors.length > 0) {
			return Promise.reject(errors);
		}
		return this.groupDao.findOneByCode(group.code)
			.then((groupToUpdate: GroupEntity) => {
				if (groupToUpdate == null) {
					return Promise.reject(GroupServiceValidator.NO_GROUP);
				}
				// Update the group entity.
				groupToUpdate.name = group.name;
				groupToUpdate.description = group.description;
				groupToUpdate.type = group.type;
				return this.groupDao.update(groupToUpdate);
			})
			.then((resultUpdate: GroupEntity) => {
				updatedGroup = resultUpdate;
				// Delete the old values
				return this.groupContentDao.removeAllByIdGroup(updatedGroup.id);
			})
			.then(() => {
				// Insert the new values.
				let newGroupContent: GroupContentEntity[];
				newGroupContent = group.values.map((value) => {
					const newContent: GroupContentEntity = new GroupContentEntity();
					newContent.idGroup = updatedGroup.id;
					newContent.value = value;
					return newContent;
				});
				return this.groupContentDao.insertMany(newGroupContent);
			})
			.then(() => {
				return this.groupAttributeValueDao.removeAllByIdGroup(updatedGroup.id);
			})
			.then(() => {
				// Insert the updated attribute - values.
				const attributeValues: GroupAttributeValueEntity[] = [];
				for (const key in group.attributes) {
					const attributeValue = new GroupAttributeValueEntity();
					attributeValue.idGroup = updatedGroup.id;
					attributeValue.key = key;
					attributeValue.value = group.attributes[key];
					attributeValues.push(attributeValue);
				}
				return this.groupAttributeValueDao.insertMany(attributeValues);
			})
			.then(() => {
				// Update attributes.
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
		return this.groupDao.findOneByCode(code)
			.then((resultQuery: GroupEntity) => {
				if (resultQuery == null) {
					this.log.warn("There is no group given the code %j", code);
					return Promise.reject(GroupServiceValidator.NO_GROUP);
				} else {
					return this.groupAttributeValueDao.removeAllByIdGroup(resultQuery.id)
						.then(() => {
							return this.groupContentDao.removeAllByIdGroup(resultQuery.id);
						})
						.then(() => {
							return this.groupDao.remove(resultQuery);
						}).then(() => {
							return Promise.resolve();
						});
				}
			});
	}

	/**
	 * Insert an element to an existing group.
	 * @param {string} code
	 * @param {t} objectToInsert The value to insert.
	 * @return {Bluebird<any>} Return a promise indicating the item is inserted.
	 * Returns a reject if the method was not able to identify a group given the code.
	 * Returns a reject if the objectToInsert exists already in the group.
	 * Return a reject if the objectToInsert is null.
	 */
	addItem(code: string, objectToInsert: t): Promise<any> {
		this.log.debug("Call to addItem with code %j, objectToInsert: %j", code, objectToInsert);
		if (objectToInsert == null) {
			const error: ValidationErrorImpl = new ValidationErrorImpl(
				GroupServiceValidator.ITEM,
				GroupServiceValidator.ITEM_EMPTY,
				"");
			return Promise.reject([error]);
		}
		return this.groupDao.findOneByCode(code)
			.then((group: GroupEntity) => {
				if (group == null) {
					this.log.warn("There is no group given the code %j", code);
					return Promise.reject(GroupServiceValidator.NO_GROUP);
				} else {
					const newContent: GroupContentEntity = new GroupContentEntity();
					newContent.idGroup = group.id;
					newContent.value = objectToInsert;
					return this.groupContentDao.insert(newContent);
				}
			})
			.then(() => {
				return Promise.resolve();
			});
	}

	/**
	 * Removes the object to all groups that has the same type.
	 * @param {string} type the type of the groups to look for.
	 * @param {t} objectToRemove The object to remove.
	 * @return {Bluebird<any>} Returns a promise indicating the operation was done.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItemByType(type: string, objectToRemove: t): Promise<any> {
		this.log.debug("Call to removeItemByType with type: %j, objectToRemove: %j ", type, objectToRemove);
		if (objectToRemove == null) {
			const error: ValidationErrorImpl = new ValidationErrorImpl(
				GroupServiceValidator.ITEM,
				GroupServiceValidator.ITEM_EMPTY,
				"");
			return Promise.reject([error]);
		}
		return this.groupDao.findByType(type)
			.then((groups: GroupEntity[]) => {
				const ids = groups.map((value) => value.id);
				return this.groupContentDao.findByIdGroupsInAndValue(ids, objectToRemove);
			})
			.then((objectsToDelete: GroupContentEntity[]) => {
				this.log.debug("The object was founded in %j records", objectsToDelete.length);
				const ids = objectsToDelete.map((value) => value.id);
				return this.groupContentDao.removeByIds(ids);
			})
			.then(() => {
				return Promise.resolve();
			});
	}

	/**
	 * Removes an item of the group.
	 * @param {string} code.
	 * @param objectToRemove The object to remove.
	 * Return a promise if the remove was successful.
	 * Returns a reject if there is no group given the code.
	 * Returns a reject if the object to remove is null or undefined.
	 */
	removeItem(code: string, objectToRemove: t): Promise<any> {
		this.log.debug("Call to removeIte with code %j", code);
		if (objectToRemove == null) {
			const error: ValidationErrorImpl = new ValidationErrorImpl(
				GroupServiceValidator.ITEM,
				GroupServiceValidator.ITEM_EMPTY,
				"");
			return Promise.reject([error]);
		}
		return this.groupDao.findOneByCode(code)
			.then((group: GroupEntity) => {
				if (group == null) {
					this.log.warn("There is no group given the code %j", code);
					return Promise.reject(GroupServiceValidator.NO_GROUP);
				} else {
					// Look for the content to delete.
					return this.groupContentDao.findByIdGroupAndValue(group.id, objectToRemove);
				}
			})
			.then((objectsToRemove: GroupContentEntity[]) => {
				const ids = objectsToRemove.map((value) => value.id);
				return this.groupContentDao.removeByIds(ids);
			})
			.then(() => {
				return Promise.resolve();
			});
	}

	/**
	 * Insert a group to a database once validated.
	 * @param {GroupImpl<t>} group
	 * @return {Bluebird<GroupImpl<t>>}
	 */
	private insertToDatabase(group: GroupImpl<t>): Promise<GroupImpl<t>> {
		const groupEntity: GroupEntity = new GroupEntity();
		groupEntity.type = group.type;
		groupEntity.name = group.name;
		groupEntity.code = group.code;
		groupEntity.description = group.description;
		let insertedGroup: GroupEntity;
		// Insert group.
		return this.groupDao.insert(groupEntity)
			.then((resultInsert: GroupEntity) => {
				insertedGroup = resultInsert;
				// Insert content.
				const groupContent: GroupContentEntity[] = [];
				for (const obj of group.values) {
					const groupContentEntity: GroupContentEntity = new GroupContentEntity();
					groupContentEntity.idGroup = resultInsert.id;
					groupContentEntity.value = obj;
					groupContent.push(groupContentEntity);
				}
				return this.groupContentDao.insertMany(groupContent);
			})
			.then(() => {
				// Insert attributes-values.
				const attributeValues: GroupAttributeValueEntity[] = [];
				for (const key in group.attributes) {
					const attributeValue = new GroupAttributeValueEntity();
					attributeValue.idGroup = insertedGroup.id;
					attributeValue.key = key;
					attributeValue.value = group.attributes[key];
					attributeValues.push(attributeValue);
				}
				return this.groupAttributeValueDao.insertMany(attributeValues);
			})
			.then(() => {
				return Promise.resolve(group);
			});
	}

	/**
	 * Convert a array of  GroupAttributeValueEntity to a dictionary.
	 * @param {GroupAttributeValueEntity[]} attributes
	 * @return {{}}
	 */
	private attributesToDictionary(attributes: GroupAttributeValueEntity[]): {} {
		const result = {};
		for (const obj of attributes) {
			result[obj.key] = obj.value;
		}
		return result;
	}

	/**
	 * This method map the input in a list of GroupImpl.
	 * @param {GroupEntity[]} groups
	 * @param {GroupAttributeValueEntity[]} attributeValues
	 * @param {GroupContentEntity[]} groupContent
	 * @return {Array<GroupImpl<t>>}
	 */
	private mixData(groups: GroupEntity[], attributeValues: GroupAttributeValueEntity[], groupContent: GroupContentEntity[]): Array<GroupImpl<t>> {
		this.log.debug("Call to mixData");
		const result: Array<GroupImpl<t>> = [];
		let group: GroupImpl<t>;
		for (const element of groups) {
			group = new GroupImpl<t>();
			group.type = element.type;
			group.name = element.name;
			group.code = element.code;
			group.description = element.description;
			group.attributes = this.attributesToDictionary(attributeValues
				.filter((value) => value.idGroup === element.id));
			group.values = groupContent.filter((value) => value.idGroup === element.id)
				.map((value) => value.value);
			result.push(group);
		}
		return result;
	}
}
