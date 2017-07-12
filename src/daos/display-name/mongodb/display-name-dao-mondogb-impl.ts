/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
import {DisplayNameDao} from "../display-name-dao";
import {DisplayNameEntity} from "../display-name-entity";
import Promise = require("bluebird");
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";

export class DisplayNameDaoMongodbImpl extends DisplayNameDao {

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
    }

    protected validateBeforeUpdate<t>(objectToUpdate: DisplayNameEntity): Promise<IValidationError[]> {
        const query = {
            $and: [
                {_id: {$ne: objectToUpdate.id}},
                {displayName: {$eq: objectToUpdate.displayName}}
            ]
        };
        return this.findAllByQuery(query)
            .then((result: DisplayNameEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        "displayName",
                        "There is another record with the same name",
                        objectToUpdate.displayName));
                }
                return Promise.resolve(errors);
            });
    }

}
