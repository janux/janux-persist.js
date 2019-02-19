/*
 * Project janux-persist.js
 * Created by ernesto on 2/19/19
 */
import * as mongoose from "mongoose";

export const TickerMongooseSchema = new mongoose.Schema(
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
		}
	},
	{id: false}
);
