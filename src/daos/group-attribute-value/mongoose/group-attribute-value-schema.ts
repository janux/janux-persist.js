/**
 * Project
 * Created by ernesto on 8/28/17.
 */
import * as mongoose from 'mongoose';

export const GroupAttributeValueMongooseSchema = new mongoose.Schema({
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
    key: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
}, {id: false});
