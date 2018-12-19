/**
 * Project glarus-services
 * Created by ernesto on 1/3/18.
 */
import * as mongoose from "mongoose";

export const BigDecimalMongooseSchema = new mongoose.Schema(
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
		value: {
			type: mongoose.Schema.Types.Decimal128
		}
	},
	{ id: false }
);
