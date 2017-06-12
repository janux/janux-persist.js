/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import {IEntityProperties} from "../../persistence/interfaces/entity-properties";
import {ExampleUser} from "./example-user";
import {ExampleUserDao} from "./example-user-dao";
import Promise = require("bluebird");
import {DbEngineUtilLokijs} from "../../persistence/impl/db-engine-util-lokijs";
import {ValidationError} from "../../persistence/impl/validation-error";

/**
 * this is the implementation for lokijs of ExampleUserDao
 */
export class ExampleUserDaoLokiJsImpl extends ExampleUserDao {

    public static createInstance(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        return this.instance || (this.instance = new this(dbEngineUtil, entityProperties));
    }

    private static instance: ExampleUserDaoLokiJsImpl;

    private lokijsCollection;

    private constructor(dbEngineUtil: DbEngineUtilLokijs, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.lokijsCollection = dbEngineUtil.collection;
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
        const errors: ValidationError[] = [];
        const id = 'id';
        const query = {
            $and: [
                {$loki: {$ne: objectToUpdate[id]}},
                {email: {$eq: objectToUpdate.email}}
            ]
        };
        const result = this.lokijsCollection.find(query);
        if (result.length > 0) {
            errors.push(new ValidationError(
                'email',
                'There is another user with the same email',
                objectToUpdate.email));
        }
        return Promise.resolve(errors);
    }
}
