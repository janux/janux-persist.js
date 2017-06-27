/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
import * as mongoose from 'mongoose';
export const AccountRoleMongoDbSchema = new mongoose.Schema({
    idAccount: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    idRole: {
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
