/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */

import * as mongoose from 'mongoose';

/**
 * Schema definition for the PartyDao an mongodb.
 * @type {"mongoose".Schema}
 */
export const PartyMongoDbSchema = new mongoose.Schema({
    idAccount: {
        type: mongoose.Schema.Types.ObjectId
    },
    typeName: {
        type: String,
        required: true
    },
    name: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    emails: {
        type: mongoose.Schema.Types.Mixed,
        required: false
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
