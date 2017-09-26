/**
 * Project
 * Created by ernesto on 8/17/17.
 */

/**
 * This is the content of a group.
 */
export interface Group<t> {

	// This is the type of the group. Examples:  "users group", "auth-context group", "services groups".
	// All groups of the same type are expected to share the same t.
	type: string;

	// Unique identifier.
	code: string;

	// A user readable name.
	name: string;

	// Description of the group.
	description: string;

	// This is a dictionary that helps to identify groups with the same type between each other.
	// All groups that shares the same type must have different key-value map.
	// It is crucial to kep the dictionary key and values as string.
	attributes: { [key: string]: string };

	// Content of the group. It is responsibility of the developer to make sure
	// the values is simple enough to be saved in a database.
	// A recommendation is to save the references of the objects.
	values: t[];
}
