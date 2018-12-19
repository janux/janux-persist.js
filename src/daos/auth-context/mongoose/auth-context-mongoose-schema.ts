/**
 * Project janux-persistence
 * Created by alejandro janux on 2017-09-07
 */

import * as mongoose from "mongoose";

export const AuthContextMongooseDbSchema = new mongoose.Schema(
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
		bit: mongoose.Schema.Types.Mixed,
		lastUpdate: {
			type: Date
		},
		dateCreated: {
			type: Date
		}
	},
	{ id: false }
);
