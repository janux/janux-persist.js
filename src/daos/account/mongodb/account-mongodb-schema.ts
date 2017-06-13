/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import * as mongoose from 'mongoose';
export const AccountMongoDbSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean
    },
    locked: {
        type: Boolean
    },
    expire: {
        type: Date
    },
    expirePassWord: {
        type: Date
    },
    contact: {
        type: mongoose.Schema.Types.Mixed
    }
});
