/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import {ExampleUser} from "../example-user";
import {ExampleUserDao} from "../example-user-dao";
import Promise = require("bluebird");
import {EntityPropertiesImpl} from "../../../persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "../../../persistence/implementations/dao/validation-error";
import {MongooseAdapter} from "../../../persistence/implementations/db-adapters/mongoose-db-adapter";

/**
 * this is the implementation for mongoose of ExampleUserDao
 */
export class ExampleUserDaoMongooseImpl extends ExampleUserDao {
    public static createInstance(dbAdapter: MongooseAdapter, entityProperties: EntityPropertiesImpl) {
        return this.instance || (this.instance = new this(dbAdapter, entityProperties));
    }

    private static instance: ExampleUserDaoMongooseImpl;

    private constructor(dbEngineUtil: MongooseAdapter, entityProperties: EntityPropertiesImpl) {
        super(dbEngineUtil, entityProperties);
    }

    /**
     * Find all users whose name contains the name string.
     * @param name
     * @return {null}
     */
    public findByNameMatch(name: string): Promise<ExampleUser[]> {
        return null;
    }

    /**
     * Validates the entity before updateMethod it. In this case checks for duplicated emails.
     * @param objectToUpdate
     * @return {null}
     */
    protected validateBeforeUpdate<t>(objectToUpdate: ExampleUser): Promise<any> {
        const query = {
            $and: [
                {id: {$ne: objectToUpdate[this.ID_REFERENCE]}},
                {email: {$eq: objectToUpdate.email}}
            ]
        };

        return this.findByQuery(query)
            .then((result) => {
                const errors: ValidationErrorImpl[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationErrorImpl(
                        'email',
                        'There is another user with the same email',
                        objectToUpdate.email));
                }
                return Promise.resolve(errors);
            });
    }
}
