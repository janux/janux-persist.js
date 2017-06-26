/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */
import * as mongoose from 'mongoose';
export const StateProvinceMongoDbSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    countryIsoCode: {
        type: String,
        required: true
    },
    sortOrder: {
        type: Number,
        required: true
    }
});
