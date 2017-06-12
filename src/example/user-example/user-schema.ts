/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */
import * as mongoose from 'mongoose';

export const MongoUserSchemaExample = new mongoose.Schema({
    name: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    }
}, {collection: 'usersExample'});
