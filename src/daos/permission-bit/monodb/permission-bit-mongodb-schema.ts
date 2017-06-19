/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */

import * as mongoose from 'mongoose';

export const PermissionBitMongoDbSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    idAuthContext: {
        type: String,
        required: true
    }
});
