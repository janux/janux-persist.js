/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as mongoose from 'mongoose';
export const PartyMongoDbSchema = new mongoose.Schema({
    idAccount: {
        type: mongoose.Schema.Types.ObjectId
    },
    type: {
        type: String,
        required: true
    },
    displayName:{
        type: String,
        required: true
    },
    name: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    emails: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    phones: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    addresses: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    lastUpdate: {
        type: Date
    },
    dateCreated: {
        type: Date
    }
});
