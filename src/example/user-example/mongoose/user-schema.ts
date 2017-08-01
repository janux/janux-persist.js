/**
 * Project janux-persistence
 * Created by ernesto on 5/30/17.
 */
import * as mongoose from 'mongoose';

/*
 * The mongoose schema associated with ExampleUser
 */
export const MongooseUserSchemaExample = new mongoose.Schema({
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
    lastUpdate: {
        type: Date
    },
    dateCreated: {
        type: Date
    }
}, {collection: 'usersExample'});
