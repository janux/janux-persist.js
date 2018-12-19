/**
 * Project
 * Created by ernesto on 8/18/17.
 */

import * as mongoose from "mongoose";

export const GroupContentMongooseSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
			index: true,
			unique: true
		},
		idGroup: {
			type: String,
			required: true,
			index: true
		},
		value: {
			type: mongoose.Schema.Types.Mixed,
			requited: true
		}
	},
	{ id: false }
);
