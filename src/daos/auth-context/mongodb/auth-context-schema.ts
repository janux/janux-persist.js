/**
 * Project janux-persistence
 * Created by ernesto on 6/19/17.
 */
/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
import * as mongoose from 'mongoose';
export const AuthContextSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    sortOrder: {
        type: Number,
        required: true
    },
    enabled: {
        type: Boolean,
        required: true
    },
    idDisplayName: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    lastUpdate: {
        type: Date
    },
    dateCreated: {
        type: Date
    }
});
