/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
import * as mongoose from 'mongoose';
export const CountryMongoDbSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isoCode: {
        type: String,
        required: true
    },
    phoneCode: {
        type: String,
        required: true
    },
    sortOrder: {
        type: Number,
        required: true
    }
});
