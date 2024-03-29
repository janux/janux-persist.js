/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */

import { EntityProperties } from "persistence/api/dao/entity-properties";

/**
 * This class helps to define extra attributes to the entity.
 * The purpose to this object is to define the extra attributes that
 * are the same for each every entity.
 */
export class EntityPropertiesImpl implements EntityProperties {
	public static createDefaultProperties(): EntityPropertiesImpl {
		return new EntityPropertiesImpl(true, true);
	}

	// If true, then the system generates an unique uuid v4 value.
	// If the dao implementation has a 'number' id, the system stores the id
	// as number.
	// If the dao implementation has a 'string' id, the system stores the id
	// as string.
	// If the dao implementation has a different variable type. For the
	// moment the ID variable type is ignores and the id is stores as string.
	// This might lead to bugs.
	// For the people who has doubts about collisions ( duplicated values) . This comment from wikipedia might help.
	// Reference: https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29
	// "Thus, for there to be a one in a billion chance of duplication, 103 trillion version 4 UUIDs must be generated."
	//
	// or ...
	//
	// "For example, the number of random version 4 UUIDs which need to be generated in order to have a 50%
	// probability of at least one collision is 2.71 quintillion, computed as follows"
	public autoGenerated: boolean;

	// Generates date for inserted record date and last modified date.
	public timeStamp: boolean;

	constructor(timeStamp: boolean, autoGenerated: boolean) {
		this.timeStamp = timeStamp;
		this.autoGenerated = autoGenerated;
	}
}
