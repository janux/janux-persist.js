/**
 * Project janux-persistence
 * Created by ernesto on 6/16/17.
 */
import * as mongoose from 'mongoose';

export const RoleMongoDbSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isRoot: {
        type: Boolean,
        required: true
    },
    idParentRole: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    enabled: {
        type: Boolean
    }
});
