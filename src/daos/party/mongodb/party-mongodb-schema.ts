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
    name: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    contact: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    lastUpdate: {
        type: Date
    },
    dateCreated: {
        type: Date
    }
});
