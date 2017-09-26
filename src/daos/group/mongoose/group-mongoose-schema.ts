/**
 * Project
 * Created by ernesto on 8/18/17.
 */

import * as mongoose from 'mongoose';

/**
 * Schema definition for the group entity
 * @type {"mongoose".Schema}
 */
export const GroupMongooseSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		index: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	code: {
		type: String,
		required: true,
		index: true,
		unique: true
	},
	type: {
		type: String,
		required: true,
		index: true
	},
	description: {
		type: String
	}
}, {id: false});
