/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import {ExampleUser} from "../example-user";
import {ExampleUserDao} from "../example-user-dao";
import Promise = require("bluebird");
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {MongoDbUtil} from "../../../persistence/util/mongodb-util.js";

/**
 * this is the implementation for mongodb of ExampleUserDao
 */
export class ExampleUserDaoMongoDbImpl extends ExampleUserDao {
    public static createInstance(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        return this.instance || (this.instance = new this(dbEngineUtil, entityProperties));
    }

    private static instance: ExampleUserDaoMongoDbImpl;

    private model: Model<any>;

    private constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.model = dbEngineUtil.model;
    }

    /**
     * Find all users whose name contains the name string.
     * @param name
     * @return {null}
     */
    public findAllByNameMatch(name: string): Promise<ExampleUser[]> {
        return null;
    }

    /**
     * Validates the entity before update it. In this case checks for duplicated emails.
     * @param objectToUpdate
     * @return {null}
     */
    protected validateBeforeUpdate<t>(objectToUpdate: ExampleUser): Promise<any> {
        const query = {
            $and: [
                {_id: {$ne: objectToUpdate.id}},
                {email: {$eq: objectToUpdate.email}}
            ]
        };

        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((result) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        'email',
                        'There is another user with the same email',
                        objectToUpdate.email));
                }
                return Promise.resolve(errors);
            });
    }
}
