/**
 * Project
 * Created by ernesto on 8/25/17.
 */

/**
 * Properties of a group.
 */
export interface GroupProperties {

	// A user readable name.
	name: string;

	// Description of the group.
	description: string;

	// Unique identifier.
	code: string;

	// This is a dictionary that helps to identify groups with the same type between each other.
	// All groups that shares the same type must have different key-value map.
	// It is crucial to kep the dictionary key and values as string.
	attributes: { [key: string]: string };

	// This is the type of the group. Examples:  "users group", "auth-context group", "services groups".
	// All groups of the same type are expected to share the same t.
	type: string;

}
