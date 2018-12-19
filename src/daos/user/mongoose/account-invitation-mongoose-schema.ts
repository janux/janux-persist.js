/**
 * Project janux-persistence
 * Created by hielo on 2018-08-17.
 */

import * as mongoose from "mongoose";

export const AccountInvitationMongooseDbSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
			index: true,
			unique: true
		},
		accountId: {
			type: String,
			required: true,
			index: true
		},
		code: {
			type: String,
			required: true
		},
		expire: {
			type: Date
		},
		status: {
			type: String,
			required: true
		},
		type: {
			type: String,
			required: true,
			default: "createAccount"
		},
		lastUpdate: {
			type: Date
		},
		dateCreated: {
			type: Date
		}
	},
	{ id: false }
);
