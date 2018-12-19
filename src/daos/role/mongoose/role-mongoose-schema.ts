/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-12
 */

import * as mongoose from "mongoose";

export const RoleMongooseDbSchema = new mongoose.Schema(
	{
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
		description: {
			type: String,
			required: true
		},
		enabled: {
			type: Boolean
		},
		sortOrder: {
			type: Number,
			default: 0
		},
		isAlmighty: {
			type: Boolean,
			default: false
		},
		authContexts: mongoose.Schema.Types.Mixed,
		permissions: mongoose.Schema.Types.Mixed,
		lastUpdate: {
			type: Date
		},
		dateCreated: {
			type: Date
		}
	},
	{ id: false }
);
