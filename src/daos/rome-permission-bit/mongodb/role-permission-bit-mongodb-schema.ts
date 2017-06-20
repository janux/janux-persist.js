/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */

import * as mongoose from 'mongoose';

export const RolePermissionBitMongoDbSchema = new mongoose.Schema({
    idPermissionBit: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    idRole: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});
