/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */
import * as mongoose from 'mongoose';

/*
 * The mongodb schema associated with ExampleUser
 */
export const MongoUserSchemaExample = new mongoose.Schema({
    name: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    uuid: {
        type: String
    },
    dateUpdated: {
        type: Date
    },
    dateCreated: {
        type: Date
    }
}, {collection: 'usersExample'});
