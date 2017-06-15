/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
import * as mongoose from 'mongoose';

export const DisplayNameMongoDbSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true
    }
});
