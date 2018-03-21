import * as mongoose from "mongoose";

/**
 * Project janux-persist.js
 * Created by ernesto on 3/20/18
 */

export const StaffDataMongooseDbSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		index: true,
		unique: true
	},
	idContact: {
		type: String,
		index: true,
		required: true
	},
	isExternal: {
		type: Boolean
	},
	jobTitle: {
		type: String
	},
	jobDepartment: {
		type: String
	}
});
