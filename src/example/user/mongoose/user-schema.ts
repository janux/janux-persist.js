/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */
import * as mongoose from "mongoose";

/*
 * The mongoose schema associated with SampleUser
 */
export const MongooseUserSchemaExample = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
			index: true,
			unique: true
		},
		name: {
			type: String
		},
		lastName: {
			type: String
		},
		email: {
			type: String
		},
		uuid: {
			type: String
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
