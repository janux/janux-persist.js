/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as _ from "lodash";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {ExampleUser} from "../example-user";
import {ExampleUserDao} from "../example-user-dao";
import Promise = require("bluebird");
import {ValidationError} from "../../../persistence/implementations/dao/validation-error";
import {LokiJsRepository} from "../../../persistence/implementations/db-engines/lokijs-repository";

/**
 * this is the implementation for lokijs of ExampleUserDao
 */
export class ExampleUserDaoLokiJsImpl extends ExampleUserDao {

    public static createInstance(dbEngineUtil: LokiJsRepository, entityProperties: IEntityProperties) {
        return this.instance || (this.instance = new this(dbEngineUtil, entityProperties));
    }

    private static instance: ExampleUserDaoLokiJsImpl;

    private constructor(dbEngineUtil: LokiJsRepository, entityProperties: IEntityProperties) {
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
        const errors: ValidationError[] = [];
        const query = {
            $and: [
                {$loki: {$ne: _.toNumber(objectToUpdate[this.ID_REFERENCE])}},
                {email: {$eq: objectToUpdate.email}}
            ]
        };

        return this.findAllByQuery(query)
            .then((resultQuery) => {
                if (resultQuery.length > 0) {
                    errors.push(new ValidationError(
                        'email',
                        'There is another user with the same email',
                        objectToUpdate.email));
                }
                return Promise.resolve(errors);
            });
    }
}
