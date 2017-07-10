/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import * as mongoose from 'mongoose';
export const UserMongoDbSchema = new mongoose.Schema({
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
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    lastUpdate: {
        type: Date
    },
    dateCreated: {
        type: Date
    },
    userId: {
        type: String
    },
    mdate: {
        type: Date
    },
    cdate: {
        type: Date
    },
    roles: [mongoose.Schema.Types.Mixed]
});
