/**
 * Project
 * Created by ernesto on 8/16/17.
 */

export class GroupEntity {
	id: string;

	// A user readable name
	name: string;

	// A unique identifier.
	code: string;

	// Description of the group
	description: string;

	// An user readable or user readable attribute to identify the content of the groups amongst
	// other groups.
	type: string;
}
