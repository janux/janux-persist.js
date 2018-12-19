/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import * as mongoose from "mongoose";

export const AccountMongooseDbSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
			index: true,
			unique: true
		},
		username: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		enabled: {
			type: Boolean
		},
		locked: {
			type: Boolean
		},
		expire: {
			type: Date
		},
		expirePassword: {
			type: Date
		},
		contactId: {
			type: String,
			required: true,
			index: true
		},
		lastUpdate: {
			type: Date
		},
		dateCreated: {
			type: Date
		},
		userId: {
			type: String
		},
		mdate: {
			type: Date
		},
		cdate: {
			type: Date
		},
		roles: [mongoose.Schema.Types.Mixed]
	},
	{ id: false }
);
