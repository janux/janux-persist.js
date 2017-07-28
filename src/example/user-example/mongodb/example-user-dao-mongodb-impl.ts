/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import {ExampleUser} from "../example-user";
import {ExampleUserDao} from "../example-user-dao";
import Promise = require("bluebird");
import {ValidationError} from "../../../persistence/implementations/dao/validation-error";
import {MongoDbRepository} from "../../../persistence/implementations/db-engines/mongodb-repository";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";

/**
 * this is the implementation for mongodb of ExampleUserDao
 */
export class ExampleUserDaoMongoDbImpl extends ExampleUserDao {
    public static createInstance(dbEngineUtil: MongoDbRepository, entityProperties: IEntityProperties) {
        return this.instance || (this.instance = new this(dbEngineUtil, entityProperties));
    }

    private static instance: ExampleUserDaoMongoDbImpl;

    private constructor(dbEngineUtil: MongoDbRepository, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
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
                {_id: {$ne: objectToUpdate[this.ID_REFERENCE]}},
                {email: {$eq: objectToUpdate.email}}
            ]
        };

        return this.findAllByQuery(query)
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
