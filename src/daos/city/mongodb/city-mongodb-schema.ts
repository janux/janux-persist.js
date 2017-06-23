/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import * as mongoose from 'mongoose';

export const CityMongoDbSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    idStateProvince: {
        type: String,
        required: true
    }
});
